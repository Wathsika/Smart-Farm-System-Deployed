import mongoose from "mongoose";
import Cow from "../models/cow.js";
import { uploadToCloudinary } from "../config/cloudinary.config.js";
import QRCode from "qrcode";

// helper: generate QR as buffer + upload
async function generateCowQR(cow) {
  const profileUrl = `${process.env.FRONTEND_URL}/admin/livestock/${cow._id}`;
  const qrBuffer = await QRCode.toBuffer(profileUrl, { type: "png" });
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
    cow.qrUrl = await generateCowQR(cow);
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

    cow.qrUrl = await generateCowQR(cow);
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
    const cow = await Cow.findById(id);
    if (!cow) return res.status(404).json({ message: "Cow not found" });
    res.json(cow);
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
