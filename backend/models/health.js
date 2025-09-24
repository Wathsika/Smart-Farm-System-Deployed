
import mongoose from "mongoose";


import mongoose from "mongoose";
const healthSchema = new mongoose.Schema(
  {
    cow: { type: mongoose.Schema.Types.ObjectId, ref: "Cow", required: true, index: true },

    date: { type: Date, required: true, index: true },   // event date
    type: {
      type: String,
      enum: [
        "CHECKUP",
        "VACCINATION",
        "TREATMENT",
        "ILLNESS",
        "INJURY",
        "OTHER",
      ],

      default: "CHECKUP",
      index: true,
    },
    temperatureC: { type: Number, min: 0, max: 60 },
    weightKg: { type: Number, min: 0, max: 2000 },
    symptoms: [{ type: String, trim: true }],
    diagnosis: { type: String, trim: true },
    medication: { type: String, trim: true },
    dosage: { type: Number, min: 0 },
    vet: { type: String, trim: true },

    nextDueDate: { type: Date }, // e.g. next vaccine due

    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);
healthSchema.index({ cow: 1, date: -1, type: 1 });

const Health = mongoose.models.Health || mongoose.model("Health", healthSchema);
export default Health;





