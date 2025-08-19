import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// --- Helper to get the start of a given date ---
const startOfDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};


// @desc    Employee clocks in
// @route   POST /api/attendance/clock-in
// @access  Private (Employee)
export const clockIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = startOfDay(new Date());

        const existingAttendance = await Attendance.findOne({ user: userId, date: today });

        if (existingAttendance) {
            return res.status(400).json({ message: "You have already clocked in today." });
        }

        const newAttendance = await Attendance.create({
            user: userId,
            date: today,
            checkIn: new Date(),
            status: "Present", // Can be adjusted based on shift start times
        });

        res.status(201).json({ message: "Clocked in successfully.", attendance: newAttendance });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// @desc    Employee clocks out
// @route   POST /api/attendance/clock-out
// @access  Private (Employee)
export const clockOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = startOfDay(new Date());

        const attendance = await Attendance.findOne({
            user: userId,
            date: today,
        });

        if (!attendance) {
            return res.status(404).json({ message: "No clock-in record found for today." });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: "You have already clocked out today." });
        }

        attendance.checkOut = new Date();
        const updatedAttendance = await attendance.save();

        res.status(200).json({ message: "Clocked out successfully.", attendance: updatedAttendance });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get attendance records (Admin can see all, Employee sees their own)
// @route   GET /api/attendance
// @access  Private (Admin, Employee)
export const getAttendanceRecords = async (req, res) => {
    try {
        const { userId, startDate, endDate, page = 1, limit = 10 } = req.query;
        const filter = {};

        // If the user is an Employee, they can only see their own records.
        if (req.user.role === 'Employee') {
            filter.user = req.user.id;
        } else if (req.user.role === 'Admin' && userId) {
            // If admin provides a userId, filter by it.
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
                .populate('user', 'fullName email jobTitle') // Join with User model
                .sort({ date: -1, createdAt: -1 })
                .skip((pg - 1) * lm)
                .limit(lm),
            Attendance.countDocuments(filter),
        ]);

        res.json({
            items,
            total,
            page: pg,
            pages: Math.ceil(total / lm)
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Admin updates an attendance record
// @route   PATCH /api/attendance/:id
// @access  Private (Admin)
export const updateAttendanceByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, status, remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid attendance ID" });
        }

        const attendance = await Attendance.findById(id);
        if (!attendance) return res.status(404).json({ message: "Attendance record not found" });

        // Update fields if they are provided
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


// @desc    Admin deletes an attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
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
export const createAttendanceByAdmin = async (req, res) => {
    try {
        const { user, date, checkIn, checkOut, status, remarks } = req.body;

        // Basic validation
        if (!user || !date || !checkIn) {
            return res.status(400).json({ message: "User ID, date, and checkIn time are required." });
        }
        
        // The controller already has this helper function from the clockIn method
        const recordDate = startOfDay(new Date(date));

        // Prevent duplicate entries for the same user on the same day
        const existingRecord = await Attendance.findOne({ user, date: recordDate });
        if (existingRecord) {
            return res.status(409).json({ message: "An attendance record for this user already exists on this date." });
        }

        const newAttendance = await Attendance.create({
            user,
            date: recordDate,
            checkIn,
            checkOut: checkOut || null, // Handle optional checkOut
            status: status || 'Present', // Handle optional status
            remarks
        });

        res.status(201).json({ message: "Attendance record created successfully.", attendance: newAttendance });

    } catch (error) {
        // Handle database errors, like invalid user ID format
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};