// controllers/attendance.controller.js
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js"; // ✅ employee model
import mongoose from "mongoose";

// --- Helper to get the start of a given date ---
const startOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// @desc Employee clocks in
// @route POST /api/attendance/clock-in
// @access Private (Employee)
export const clockIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = startOfDay(new Date());

    // ✅ දැනටමත් check out නොකළ වාර්තාවක් ඇත්දැයි පරීක්ෂා කිරීම
    const activeSession = await Attendance.findOne({ user: userId, date: today, checkOut: null });
    if (activeSession) {
      return res.status(400).json({ message: "You must clock out before you can clock in again." });
    }

    // ✅ සෑම විටම නව පැමිණීමේ වාර්තාවක් සාදන්න
    const newAttendance = await Attendance.create({
      user: userId,
      date: today,
      checkIn: new Date(),
      status: "Present",
    });

    res.status(201).json({ message: "Clocked in successfully.", attendance: newAttendance });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Employee clocks out
// @route POST /api/attendance/clock-out
// @access Private (Employee)
export const clockOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = startOfDay(new Date());

    // ✅ Check out කිරීමට අදාළ (checkOut: null) නවතම වාර්තාව සොයාගැනීම
    const attendance = await Attendance.findOne({ user: userId, date: today, checkOut: null }).sort({ checkIn: -1 });

    if (!attendance) {
      return res.status(404).json({ message: "No active clock-in record found to clock out." });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    let hoursWorked = 0;
    if (attendance.checkIn && attendance.checkOut) {
      const diffMs = new Date(attendance.checkOut) - new Date(attendance.checkIn);
      hoursWorked = diffMs / (1000 * 60 * 60); // ms → hrs

      // ✅ සේවකයාගේ මුළු වැඩකළ පැය ගණනට මෙම session එකේ පැය ගණන එකතු කිරීම
      await Employee.findOneAndUpdate(
        { user: userId },
        { $inc: { workingHours: hoursWorked } }
      );
    }

    return res.json({
      message: "Clocked out successfully.",
      attendance,
      hoursWorked,
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get attendance records
// @route GET /api/attendance
// @access Private (Admin, Employee)
export const getAttendanceRecords = async (req, res) => {
  try {
    const { userId, startDate, endDate, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role === "Employee") {
      filter.user = req.user.id;
    } else if (req.user.role === "Admin" && userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      filter.user = userId;
    }

    if (startDate && endDate) {
      filter.date = { $gte: startOfDay(startDate), $lte: startOfDay(endDate) };
    }

    const pg = Math.max(parseInt(page), 1);
    const lm = Math.min(Math.max(parseInt(limit), 1), 100);

    const [items, total] = await Promise.all([
      Attendance.find(filter)
        .populate("user", "fullName email jobTitle")
        .sort({ checkIn: 1 }) // ✅ පැමිණි පිළිවෙලට පෙන්වීමට sort එක වෙනස් කිරීම
        .skip((pg - 1) * lm)
        .limit(lm),
      Attendance.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pg,
      pages: Math.ceil(total / lm),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Admin updates attendance
// @route PATCH /api/attendance/:id
// @access Private (Admin)
export const updateAttendanceByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, status, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid attendance ID" });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ message: "Attendance record not found" });

    if (checkIn) attendance.checkIn = checkIn;
    if (checkOut !== undefined) attendance.checkOut = checkOut;
    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    const updatedAttendance = await attendance.save();

    res.json({ message: "Attendance updated successfully", attendance: updatedAttendance });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Admin deletes attendance
// @route DELETE /api/attendance/:id
// @access Private (Admin)
export const deleteAttendanceByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid attendance ID" });
    }

    const del = await Attendance.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: "Record not found" });

    res.json({ message: "Attendance record deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Admin creates attendance manually
// @route POST /api/attendance
// @access Private (Admin)
export const createAttendanceByAdmin = async (req, res) => {
  try {
    const { user, date, checkIn, checkOut, status, remarks } = req.body;

    if (!user || !date || !checkIn) {
      return res.status(400).json({ message: "User ID, date, and checkIn time are required." });
    }

    const recordDate = startOfDay(new Date(date));

    // Admin can create multiple records too, so we remove the duplicate check or modify it
    // For simplicity, we allow creating it. You might want to add a different logic here.
    // const existingRecord = await Attendance.findOne({ user, date: recordDate });
    // if (existingRecord) {
    //   return res.status(409).json({ message: "Attendance already exists for this user on this date." });
    // }

    const newAttendance = await Attendance.create({
      user,
      date: recordDate,
      checkIn,
      checkOut: checkOut || null,
      status: status || "Present",
      remarks,
    });

    res.status(201).json({ message: "Attendance record created successfully.", attendance: newAttendance });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};