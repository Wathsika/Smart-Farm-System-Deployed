// backend/models/health.js
const mongoose = require("mongoose");

const healthSchema = new mongoose.Schema(
  {
    cow: { type: mongoose.Schema.Types.ObjectId, ref: "Cow", required: true, index: true },
    date: { type: Date, required: true, index: true },   // visit / event date (normalized at midnight)
    type: {
      type: String,
      enum: ["CHECKUP", "VACCINATION", "DEWORMING", "TREATMENT", "ILLNESS", "INJURY", "AI", "BIRTH", "OTHER"],
      default: "CHECKUP",
      index: true,
    },
    temperatureC: { type: Number, min: 0, max: 60 },
    weightKg: { type: Number, min: 0, max: 2000 },
    symptoms: [{ type: String, trim: true }],
    diagnosis: { type: String, trim: true },
    medication: { type: String, trim: true },
    dosage: { type: String, trim: true },
    vet: { type: String, trim: true },
    nextDueDate: { type: Date }, // e.g. next vaccine/deworm due
    notes: { type: String, trim: true, maxlength: 1000 },
    recordedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

// helpful compound index for ranges
healthSchema.index({ cow: 1, date: -1, type: 1 });

module.exports = mongoose.models.Health || mongoose.model("Health", healthSchema);
