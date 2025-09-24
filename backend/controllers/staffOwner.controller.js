// controllers/staffOwner.controller.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js"; // Import Attendance model
import LeaveRequest from "../models/LeaveRequest.js"; // Import LeaveRequest model

// Helper to get the start of a given date (resides here too for consistency)
const startOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0); //
  return newDate;
};

// Helper to check if a date is within an approved leave range
const isOnApprovedLeave = (leaveRequests, dateToCheck) => {
    const checkDateStart = startOfDay(dateToCheck).getTime();
    for (const leave of leaveRequests) {
        if (leave.status === "Approved") {
            const leaveStartDate = startOfDay(new Date(leave.startDate)).getTime();
            const leaveEndDate = startOfDay(new Date(leave.endDate)).getTime();
            if (checkDateStart >= leaveStartDate && checkDateStart <= leaveEndDate) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Add a new user (Admin only)
 */
export const addUserByAdmin = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      jobTitle,
      status,
      basicSalary,
      workingHours,
      allowance,
      loan,
    } = req.body;

    // check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      jobTitle,
      status,
    });

    // if employee, create employee record
    if (role === "Employee") {
      await Employee.create({
        user: user._id,
        jobTitle,
        basicSalary,
        workingHours: workingHours || 0,
        accumulatedWorkingHours: 0, // Initialize the new field
        allowance: allowance || 0,
        loan: loan || 0,
      });
    }

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error("❌ addUserByAdmin error:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

/**
 * List only employees (with optional search & pagination)
 * Now includes dynamic attendance status for the current day.
 */
export const listUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query; // q, page, limit remain useful for admin user list overall
    const query = { role: "Employee" }; // 🔹 Only employees

    if (q) {
      query.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { jobTitle: { $regex: q, $options: "i" } },
      ];
    }

    const pg = Math.max(parseInt(page), 1);
    const lm = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (pg - 1) * lm;

    // Fetch all employees first
    const employees = await User.find(query)
      .skip(skip)
      .limit(Number(lm))
      .lean();

    const total = await User.countDocuments(query);

    const userIds = employees.map((u) => u._id);

    // Fetch all employee details and leave requests in parallel
    const [empDetails, leaveRequestsForUsers] = await Promise.all([
      Employee.find({ user: { $in: userIds } }).lean(),
      LeaveRequest.find({ user: { $in: userIds } }).lean(),
    ]);

    const empMap = {};
    empDetails.forEach((e) => {
      empMap[e.user.toString()] = e;
    });

    const leaveRequestsMap = {};
    leaveRequestsForUsers.forEach(lr => {
        if (!leaveRequestsMap[lr.user.toString()]) {
            leaveRequestsMap[lr.user.toString()] = [];
        }
        leaveRequestsMap[lr.user.toString()].push(lr);
    });

    const today = new Date();
    const todayStart = startOfDay(today);
    const eightAMToday = new Date(today);
    eightAMToday.setHours(8, 0, 0, 0);

    const items = await Promise.all(employees.map(async (u) => {
      const empExtra = empMap[u._id.toString()] || {};
      const userLeaveRequests = leaveRequestsMap[u._id.toString()] || [];

      let currentAttendanceStatus = "Absent"; // Default status
      let todayFirstCheckIn = null;
      let todayLastCheckOut = null;
      let todayPrimaryAttendanceRecordId = null; // ID of a record for editing/deleting

      // 1. Check for Approved Leave
      const onLeaveToday = isOnApprovedLeave(userLeaveRequests, today);
      if (onLeaveToday) {
        currentAttendanceStatus = "On Leave";
      } else {
        // 2. Check attendance records for today if not on leave
        const attendanceRecordsToday = await Attendance.find({
          user: u._id,
          date: todayStart, // Filter by start of the day
        }).sort({ checkIn: 1 }).lean();

        if (attendanceRecordsToday.length > 0) {
          todayPrimaryAttendanceRecordId = attendanceRecordsToday[0]._id;
          todayFirstCheckIn = attendanceRecordsToday[0].checkIn;

          let latestCheckOut = null;
          let anyOpenSession = false;

          attendanceRecordsToday.forEach(record => {
            if (record.checkOut) {
              if (!latestCheckOut || record.checkOut > latestCheckOut) {
                latestCheckOut = record.checkOut;
              }
            } else {
              anyOpenSession = true; // Found an open session
            }
          });
          todayLastCheckOut = latestCheckOut; // Latest check-out among closed sessions

          // Determine status based on first check-in and if any session is open
          if (anyOpenSession) { // Employee is currently clocked in
              if (new Date(todayFirstCheckIn).getTime() > eightAMToday.getTime()) {
                currentAttendanceStatus = "Late"; // Clocked in late, still working
              } else {
                currentAttendanceStatus = "Present"; // Clocked in on time, still working
              }
          } else { // All sessions are closed (employee clocked in AND clocked out)
              currentAttendanceStatus = "Absent"; // As per new requirement: after clock out, status becomes Absent.
          }
        }
        // If no attendance records and not on leave, currentAttendanceStatus remains "Absent" (from default)
      }
      
      return {
        ...u,
        basicSalary: empExtra.basicSalary || 0,
        workingHours: empExtra.workingHours || 0,
        accumulatedWorkingHours: empExtra.accumulatedWorkingHours || 0,
        allowance: empExtra.allowance || 0,
        loan: empExtra.loan || 0,
        currentAttendanceStatus, // Dynamic status for today
        todayFirstCheckIn,
        todayLastCheckOut,
        todayPrimaryAttendanceRecordId,
      };
    }));

    res.json({
      items,
      total,
      page: pg,
      pages: Math.ceil(total / lm),
    });
  } catch (err) {
    console.error("❌ listUsers error:", err);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};


/**
 * Get single user by id
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "Employee") {
      const emp = await Employee.findOne({ user: user._id }).lean();
      if (emp) {
        user.basicSalary = emp.basicSalary;
        user.workingHours = emp.workingHours;
        user.accumulatedWorkingHours = emp.accumulatedWorkingHours;
        user.allowance = emp.allowance;
        user.loan = emp.loan;
      }
    }

    res.json(user);
  } catch (err) {
    console.error("❌ getUserById error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/**
 * Update Employee (Admin only)
 */
export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // User _id
    const updates = { ...req.body };

    // Handle password
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password;
    }

    // Update User first
    const user = await User.findByIdAndUpdate(
      id,
      {
        fullName: updates.fullName,
        email: updates.email,
        password: updates.password,
        status: updates.status, // user status (active/inactive)
        jobTitle: updates.jobTitle,
      },
      { new: true }
    ); //

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update Employee extra fields
    await Employee.findOneAndUpdate(
      { user: user._id },
      {
        jobTitle: updates.jobTitle,
        basicSalary: updates.basicSalary,
        workingHours: updates.workingHours,
        allowance: updates.allowance,
        loan: updates.loan,
      },
      { upsert: true, new: true }
    ); //

    res.json({ message: "Employee updated successfully", user });
  } catch (err) {
    console.error("❌ updateUserByAdmin error:", err);
    res.status(500).json({ message: "Failed to update employee" });
  }
};

/**
 * Delete Employee (Admin only)
 */
export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // User _id
    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // If it was an Employee → delete from Employee collection too
    await Employee.findOneAndDelete({ user: user._id });
    // Also delete any associated attendance records for this user
    await Attendance.deleteMany({ user: user._id });
    // Also delete any associated leave requests for this user
    await LeaveRequest.deleteMany({ user: user._id });


    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("❌ deleteUserByAdmin error:", err);
    res.status(500).json({ message: "Failed to delete employee" });
  }
};