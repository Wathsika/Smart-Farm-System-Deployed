import Health from "../models/health.js";
import Cow from "../models/cow.js";

function startOfDay(input) {
  const d = new Date(input);
  if (isNaN(+d)) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ----------- CRUD ----------- */
export const createHealth = async (req, res, next) => {
  try {
    const {
      cow,
      date,
      type = "CHECKUP",
      temperatureC,
      weightKg,
      symptoms,
      diagnosis,
      medication,
      dosage,
      vet,
      nextDueDate,
      notes,
    } = req.body;

    if (!cow || !date)
      return res.status(400).json({ message: "cow and date are required" });

    const d = startOfDay(date);
    if (!d) return res.status(400).json({ message: "Invalid date" });

    const exists = await Cow.exists({ _id: cow });
    if (!exists) return res.status(404).json({ message: "Cow not found" });

    const doc = await Health.create({
      cow,
      date: d,
      type,
      temperatureC,
      weightKg,
      symptoms: Array.isArray(symptoms)
        ? symptoms
        : typeof symptoms === "string"
        ? symptoms.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      diagnosis,
      medication,
      dosage: dosage !== "" && dosage !== undefined ? Number(dosage) : undefined,
      vet,
      nextDueDate: nextDueDate ? startOfDay(nextDueDate) : undefined,
      notes,
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

export const listHealth = async (req, res, next) => {
  try {
    const { cow, type, from, to, page = 1, limit = 20 } = req.query;
    const q = {};
    if (cow) q.cow = cow;
    if (type) q.type = type;
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = startOfDay(from);
      if (to) {
        const t = startOfDay(to);
        if (t) t.setDate(t.getDate() + 1);
        q.date.$lt = t;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Health.find(q)
        .populate("cow", "name tagId breed gender")
        .sort({ date: -1, _id: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Health.countDocuments(q),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const getHealth = async (req, res, next) => {
  try {
    const doc = await Health.findById(req.params.id).populate(
      "cow",
      "name tagId breed gender bday"
    );
    if (!doc) return res.status(404).json({ message: "Record not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const updateHealth = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.date) {
      const d = startOfDay(payload.date);
      if (!d) return res.status(400).json({ message: "Invalid date" });
      payload.date = d;
    }
    if (payload.nextDueDate)
      payload.nextDueDate = startOfDay(payload.nextDueDate);

    if (payload.symptoms && typeof payload.symptoms === "string") {
      payload.symptoms = payload.symptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (payload.dosage !== undefined && payload.dosage !== "") {
      payload.dosage = Number(payload.dosage);
    }

    const updated = await Health.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    });
    if (!updated) return res.status(404).json({ message: "Record not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteHealth = async (req, res, next) => {
  try {
    const del = await Health.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Record not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// upcoming due (default next 14 days)
export const upcomingDue = async (req, res, next) => {
  try {
    const days = Number(req.query.days || 14);
    const from = startOfDay(new Date());
    const to = startOfDay(new Date());
    to.setDate(to.getDate() + days + 1);

    const q = { nextDueDate: { $gte: from, $lt: to } };
    if (req.query.cow) q.cow = req.query.cow;

    const items = await Health.find(q)
      .populate("cow", "name tagId")
      .sort({ nextDueDate: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};
