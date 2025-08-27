// controllers/attendance.controller.js
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
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

    // Check out නොකළ active session එකක් ඇත්දැයි පරීක්ෂා කිරීම
    const activeSession = await Attendance.findOne({ user: userId, date: today, checkOut: null });
    if (activeSession) {
      return res.status(400).json({ message: "You must clock out before you can clock in again." });
    }

    // සෑම විටම නව වාර්තාවක් නිර්මාණය කිරීම
    const newAttendance = await Attendance.create({
      user: userId,
      date: today,
      checkIn: new Date(),
      status: "Present",
    });

    res.status(201).json({ message: "Clocked in successfully.", attendance: newAttendance });
  } catch (error) {
    console.error("Clock-in error:", error); // Server console එකේ දෝෂය පෙන්වීමට
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

    // Check out කිරීමට අදාළ (checkOut: null) නවතම වාර්තාව සොයාගැනීම
    const attendance = await Attendance.findOne({ user: userId, date: today, checkOut: null }).sort({ checkIn: -1 });

    if (!attendance) {
      return res.status(404).json({ message: "No active clock-in record found to clock out." });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    let hoursWorked = 0;
    if (attendance.checkIn && attendance.checkOut) {
      const diffMs = new Date(attendance.checkOut) - new Date(attendance.checkIn);
      hoursWorked = diffMs / (1000 * 60 * 60); // ms -> hrs

      // `$inc` මගින් පැරණි workingHours අගයට නව අගය එකතු කිරීම
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
    console.error("Clock-out error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get current day attendance records for the logged-in employee (FOR DASHBOARD)
// @route GET /api/attendance/today
// @access Private (Employee)
export const getTodaysAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStart = startOfDay(new Date());

    const records = await Attendance.find({
      user: userId,
      date: todayStart,
    }).sort({ checkIn: 1 }); // පැමිණි පිළිවෙලට සකස් කිරීම

    res.json({ items: records });

  } catch (error) {
    console.error("Get today's attendance error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get attendance records (FOR ADMIN/REPORTS)
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
        .sort({ checkIn: 1 })
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
    console.error("Get attendance records error:", error);
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
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid attendance ID" });
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
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid attendance ID" });
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
    if (!user || !date || !checkIn) return res.status(400).json({ message: "User ID, date, and checkIn time are required." });
    const recordDate = startOfDay(new Date(date));
    const newAttendance = await Attendance.create({ user, date: recordDate, checkIn, checkOut: checkOut || null, status: status || "Present", remarks });
    res.status(201).json({ message: "Attendance record created successfully.", attendance: newAttendance });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};