
import mongoose from "mongoose";

const breedingSchema = new mongoose.Schema(
  {
    cow: { type: mongoose.Schema.Types.ObjectId, ref: "Cow", required: true, index: true },

    eventType: {
      type: String,
      enum: ["insemination", "pregnancyCheck", "calving", "heat"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["planned", "done", "missed", "cancelled"], 
      default: "planned",
      index: true,
    },

    serviceDate: { type: Date, required: true },
    nextDueDate: { type: Date },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

export default mongoose.models.Breeding || mongoose.model("Breeding", breedingSchema);
