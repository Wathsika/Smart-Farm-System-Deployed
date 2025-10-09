import mongoose from "mongoose";
import Cow from "../models/cow.js";
import Health from "../models/health.js";
import Milk from "../models/milk.js";
import { uploadToCloudinary } from "../config/cloudinary.config.js";
import QRCode from "qrcode";

function startOfDay(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(input) {
  const d = startOfDay(input);
  if (!d) return null;
  d.setDate(d.getDate() + 1);
  return d;
}

function pickSummary(record, fallbackTypeLabel = "") {
  if (!record) return "";
  const candidates = [
    record.medication,
    record.diagnosis,
    Array.isArray(record.symptoms) ? record.symptoms.join(", ") : undefined,
    record.notes,
    fallbackTypeLabel,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "";
}

function resolveFrontendBase(req) {
  const candidates = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    process.env.PUBLIC_FRONTEND_URL,
  ];

  for (const raw of candidates) {
    if (typeof raw === "string" && raw.trim()) {
      return raw.trim().replace(/\/$/, "");
    }
  }

  if (req) {
    const origin = req.get?.("origin");
    if (origin && origin.trim()) {
      return origin.trim().replace(/\/$/, "");
    }

    const host = req.get?.("host");
    if (host && host.trim()) {
      const forwardedProto = req.get?.("x-forwarded-proto");
      const protocol = (forwardedProto?.split(",")[0] || req.protocol || "http").replace(/:$/, "");
      return `${protocol}://${host.trim()}`.replace(/\/$/, "");
    }
  }

  return "";
}

// helper: generate QR as buffer + upload
async function generateCowQR(cow, req) {
  // Ensure the QR links to the dedicated public cow page
  const frontendBase = resolveFrontendBase(req);
  const profilePath = `/cow/${cow._id}`;
  const profileUrl = frontendBase ? `${frontendBase}${profilePath}` : profilePath;

  const qrBuffer = await QRCode.toBuffer(profileUrl, {
    type: "png",
    errorCorrectionLevel: "M",
    width: 512,
    margin: 1,
  });

  const qrUrl = await uploadToCloudinary(qrBuffer, "smart_farm_qr");
  return qrUrl;
}

// Add cow
export const addCow = async (req, res, next) => {
  try {
    const { name, breed, bday, gender } = req.body;
    if (!name || !breed || !bday || !gender) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    let photoUrl = "";
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer, "smart_farm_cows");
    }

    let cow = await Cow.create({ name, breed, bday, gender, photoUrl });

    // generate QR
    cow.qrUrl = await generateCowQR(cow, req);
    await cow.save();

    res.status(201).json(cow);
  } catch (err) {
    next(err);
  }
};

// Regenerate QR
export const regenerateCowQR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cow = await Cow.findById(id);
    if (!cow) return res.status(404).json({ message: "Cow not found" });

    cow.qrUrl = await generateCowQR(cow, req);
    await cow.save();

    res.json({ qrUrl: cow.qrUrl });
  } catch (err) {
    next(err);
  }
};

// List cows
export const listCows = async (_req, res, next) => {
  try {
    const cows = await Cow.find().sort({ cowId: -1 });
    res.json(cows);
  } catch (err) {
    next(err);
  }
};

// Get single cow
export const getCow = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const cow = await Cow.findById(id).lean();
    if (!cow) return res.status(404).json({ message: "Cow not found" });

    const todayStart = startOfDay(new Date());
    const tomorrowStart = endOfDay(new Date());

    const [latestHealth, upcomingVaccinationRaw, milkAggregation] = await Promise.all([
      Health.findOne({ cow: cow._id })
        .sort({ date: -1, createdAt: -1 })
        .lean(),
      (async () => {
        const futureVaccination = await Health.findOne({
          cow: cow._id,
          type: "VACCINATION",
          $or: [
            { nextDueDate: { $gte: todayStart } },
            { date: { $gte: todayStart } },
          ],
        })
          .sort({ nextDueDate: 1, date: 1, createdAt: 1 })
          .lean();

        if (futureVaccination) return futureVaccination;

        return Health.findOne({ cow: cow._id, type: "VACCINATION" })
          .sort({ date: -1, nextDueDate: -1, createdAt: -1 })
          .lean();
      })(),
      Milk.aggregate([
        {
          $match: {
            cow: cow._id,
            date: { $gte: todayStart, $lt: tomorrowStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$volumeLiters" },
          },
        },
      ]),
    ]);

    const upcomingVaccination = (() => {
      if (!upcomingVaccinationRaw) return null;
      const dueDate = upcomingVaccinationRaw.nextDueDate || upcomingVaccinationRaw.date || null;
      const fallbackLabel = (() => {
        const type = (upcomingVaccinationRaw.type || "").toUpperCase();
        if (type === "VACCINATION") return "Vaccination";
        return upcomingVaccinationRaw.type || "Vaccination";
      })();
      const summary = pickSummary(upcomingVaccinationRaw, fallbackLabel);

      return {
        id: upcomingVaccinationRaw._id,
        date: dueDate,
        vaccineName: summary || "Scheduled vaccination",
        vet: upcomingVaccinationRaw.vet || undefined,
        notes: upcomingVaccinationRaw.notes || undefined,
      };
    })();

    const lastHealthRecord = (() => {
      if (!latestHealth) return null;
      const summary = pickSummary(latestHealth, latestHealth.type || "Health record");

      return {
        id: latestHealth._id,
        date: latestHealth.date,
        condition: summary || "General checkup",
        vet: latestHealth.vet || undefined,
      };
    })();

    const todayMilkTotal = milkAggregation?.[0]?.total ?? 0;
    const todayMilk = Math.round(Number(todayMilkTotal || 0) * 100) / 100;

    res.json({
      ...cow,
      upcomingVaccination,
      lastHealthRecord,
      todayMilk,
    });
  } catch (err) {
    next(err);
  }
};

// Update cow
export const updateCow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.photoUrl = await uploadToCloudinary(req.file.buffer, "smart_farm_cows");
    }

    const cow = await Cow.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!cow) return res.status(404).json({ message: "Cow not found" });
    res.json(cow);
  } catch (err) {
    next(err);
  }
};

// Delete cow
export const deleteCow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cow = await Cow.findByIdAndDelete(id);
    if (!cow) return res.status(404).json({ message: "Cow not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
