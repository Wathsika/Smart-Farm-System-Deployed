
import mongoose from "mongoose";

const milkSchema = new mongoose.Schema(
  {
    cow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cow",                 
      required: [true, "Cow is required"],
      index: true,
    },
    
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    shift: {
      type: String,
      enum: ["AM", "PM", "OTHER"],
      default: "AM",
      index: true,
    },
    volumeLiters: {
      type: Number,
      required: [true, "Milk volume (L) is required"],
      min: [0, "Volume must be >= 0"],
    },
    fatPct: { type: Number, min: 0, max: 100 },   
    snfPct: { type: Number, min: 0, max: 100 },   
    notes: { type: String, trim: true, maxlength: 500 },
    recordedBy: { type: String, trim: true },
  },
  { timestamps: true }
);


milkSchema.index({ cow: 1, date: 1, shift: 1 }, { unique: true });

const Milk = mongoose.models.Milk || mongoose.model("Milk", milkSchema);

export default Milk;
