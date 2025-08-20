// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true }, // ✅ ADD THIS LINE
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  status: { type: String, enum: ["Present", "Absent", "Late", "On Leave"], default: "Present" },
  remarks: { type: String, trim: true }, // Optional: Add remarks field used in StaffAttendance.jsx
}, { timestamps: true });

// ✅ Add an index for faster lookups
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);