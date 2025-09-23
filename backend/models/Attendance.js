
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true }, 
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  status: { type: String, enum: ["Present", "Absent", "Late", "On Leave"], default: "Present" },
  remarks: { type: String, trim: true }, 
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);

