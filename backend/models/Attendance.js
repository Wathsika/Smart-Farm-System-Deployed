// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  status: { type: String, enum: ["Present", "Absent", "Late", "On Leave"], default: "Present" },
  remarks: { type: String, trim: true },
}, { timestamps: true });

// බහුවිධ check-in/out සඳහා unique index එක ඉවත් කර ඇත.
// attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);