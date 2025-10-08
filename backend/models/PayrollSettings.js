import mongoose from "mongoose";

const PayrollSettingsSchema = new mongoose.Schema(
  {
    daysPerMonth: { type: Number, required: true, min: 0 },
    hoursPerDay: { type: Number, required: true, min: 0 },
    otWeekdayMultiplier: { type: Number, required: true, min: 0 },
    otHolidayMultiplier: { type: Number, required: true, min: 0 },
    epfRate: { type: Number, required: true, min: 0, max: 1 }, // 0.08 = 8%
    etfRate: { type: Number, required: true, min: 0, max: 1 }, // 0.03 = 3%
    // optional: lock to single-row via a fixed key
    key: { type: String, unique: true, default: "singleton" },
  },
  { timestamps: true, versionKey: false }   
);   
  
export default mongoose.model("PayrollSettings", PayrollSettingsSchema);
