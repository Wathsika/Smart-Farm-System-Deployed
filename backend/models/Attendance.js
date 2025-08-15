import mongoose from "mongoose";
const AttendanceSchema = new mongoose.Schema(
{
// Link to the user who this record belongs to
user: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},
// The date the attendance is for. We store it separately to easily query for a specific day.
date: {
type: Date,
required: true,
},
checkIn: {
type: Date,
required: true,
},
checkOut: {
type: Date,
},
status: {
type: String,
enum: ["Present", "Absent", "Late", "On Leave"],
default: "Present",
},
remarks: {
type: String,
trim: true,
},
},
{ timestamps: true }
);
// Compound index to prevent duplicate entries for the same user on the same day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });
const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;