// controllers/staffOwner.controller.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js"; // Import Attendance model
import LeaveRequest from "../models/LeaveRequest.js"; // Import LeaveRequest model
import generateEmployeeId from "../utils/generateEmployeeId.js";

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

const PHONE_REGEX = /^\+?\d{9,15}$/;
const BANK_ACCOUNT_REGEX = /^\d{6,20}$/;
const NATIONAL_ID_REGEX = /^[A-Z0-9-]{5,20}$/;
const NAME_REGEX = /^[a-zA-Z\s-]{2,100}$/;
const TITLE_REGEX = NAME_REGEX;
const TEXT_REGEX = /^[a-zA-Z&\s-]{2,100}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENDERS = ["Male", "Female", "Other"];
const EMPLOYMENT_TYPES = ["Permanent", "Contract", "Intern"];
const MINIMUM_EMPLOYEE_AGE = 18;

const parseCurrencyField = (value, fieldName, { required = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }
    return 0;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    throw new Error(`${fieldName} must be a number.`);
  }
  if (numeric < 0) {
    throw new Error(`${fieldName} cannot be negative.`);
  }
  if (numeric > 1_000_000) {
    throw new Error(`${fieldName} cannot exceed Rs. 1,000,000.`);
  }

  const decimalPart = String(value).split(".")[1];
  if (decimalPart && decimalPart.length > 2) {
    throw new Error(`${fieldName} can have at most 2 decimal places.`);
  }

  return Number(numeric.toFixed(2));
};

const parseWorkingHours = (value) => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    throw new Error("Working Hours must be a number.");
  }
  if (numeric < 1) {
    throw new Error("Working Hours must be at least 1.");
  }
  if (numeric > 60) {
    throw new Error("Working Hours cannot exceed 60.");
  }

  const decimalPart = String(value).split(".")[1];
  if (decimalPart && decimalPart.length > 2) {
    throw new Error("Working Hours can have at most 2 decimal places.");
  }

  return Number(numeric.toFixed(2));
};

const calculateAge = (dob) => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const buildEmployeeDetails = (payload = {}) => {
  const jobTitle = (payload.jobTitle || "").trim();
  if (!jobTitle) {
    throw new Error("Job Title is required.");
  }
  if (!TITLE_REGEX.test(jobTitle)) {
    throw new Error("Job Title can only contain letters, spaces, and hyphens.");
  }

  const nationalIdRaw = (payload.nationalId || "").toString().trim().toUpperCase();
  if (!nationalIdRaw) {
    throw new Error("National ID/Passport Number is required.");
  }
  if (!NATIONAL_ID_REGEX.test(nationalIdRaw)) {
    throw new Error("National ID/Passport Number must be 5-20 characters and contain only letters, numbers, or hyphens.");
  }

  const gender = (payload.gender || "").trim();
  if (!GENDERS.includes(gender)) {
    throw new Error("Gender selection is invalid.");
  }

  const dob = new Date(payload.dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    throw new Error("Date of Birth is invalid.");
  }
  const today = new Date();
  if (dob > today) {
    throw new Error("Date of Birth cannot be in the future.");
  }
  if (calculateAge(dob) < MINIMUM_EMPLOYEE_AGE) {
    throw new Error(`Employee must be at least ${MINIMUM_EMPLOYEE_AGE} years old.`);
  }

  const address = (payload.address || "").toString().trim();
  if (!address) {
    throw new Error("Address is required.");
  }
  if (address.length < 10) {
    throw new Error("Address must be at least 10 characters long.");
  }
  if (address.length > 250) {
    throw new Error("Address cannot exceed 250 characters.");
  }

  const phoneNumber = (payload.phoneNumber || "").toString().trim();
  if (!phoneNumber) {
    throw new Error("Phone Number is required.");
  }
  if (!PHONE_REGEX.test(phoneNumber)) {
    throw new Error("Phone Number must contain 9 to 15 digits and may start with +.");
  }

  const contactPhoneNumber = (payload.contactPhoneNumber || "").toString().trim();
  if (!contactPhoneNumber) {
    throw new Error("Contact Phone Number is required.");
  }
  if (!PHONE_REGEX.test(contactPhoneNumber)) {
    throw new Error("Contact Phone Number must contain 9 to 15 digits and may start with +.");
  }

  const department = (payload.department || "").toString().trim();
  if (!department) {
    throw new Error("Department is required.");
  }
  if (!TEXT_REGEX.test(department)) {
    throw new Error("Department can only contain letters, spaces, ampersands, and hyphens.");
  }

  const employmentType = (payload.employmentType || "").toString().trim();
  if (!EMPLOYMENT_TYPES.includes(employmentType)) {
    throw new Error("Employment Type selection is invalid.");
  }

  const startDate = new Date(payload.startDate);
  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Start Date is invalid.");
  }
  const startDateNormalized = startOfDay(startDate);
  const todayStart = startOfDay(new Date());
  if (startDateNormalized > todayStart) {
    throw new Error("Start Date cannot be in the future.");
  }

  const bankName = (payload.bankName || "").toString().trim();
  if (!bankName) {
    throw new Error("Bank Name is required.");
  }
  if (!TEXT_REGEX.test(bankName)) {
    throw new Error("Bank Name can only contain letters, spaces, ampersands, and hyphens.");
  }

  const bankAccountNumberRaw = (payload.bankAccountNumber || "").toString().trim();
  const bankAccountNumber = bankAccountNumberRaw.replace(/\s+/g, "");
  if (!bankAccountNumber) {
    throw new Error("Bank Account Number is required.");
  }
  if (!BANK_ACCOUNT_REGEX.test(bankAccountNumber)) {
    throw new Error("Bank Account Number must be 6 to 20 digits.");
  }

  const basicSalary = parseCurrencyField(payload.basicSalary, "Basic Salary", { required: true });
  const workingHours = parseWorkingHours(payload.workingHours);
  const allowance = parseCurrencyField(payload.allowance, "Allowance");
  const loan = parseCurrencyField(payload.loan, "Loan");

  return {
    jobTitle,
    nationalId: nationalIdRaw,
    gender,
    dateOfBirth: dob,
    address,
    phoneNumber,
    department,
    startDate: startDateNormalized,
    employmentType,
    bankName,
    bankAccountNumber,
    contactPhoneNumber,
    basicSalary,
    workingHours,
    allowance,
    loan,
  };
};

const validateEmployeeDetails = (payload = {}) => {
  try {
    const value = buildEmployeeDetails(payload);
    return { ok: true, value };
  } catch (err) {
    return { ok: false, message: err.message || "Invalid employee details." };
  }
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
      role = "Employee",
      status = "active",
    } = req.body;

    const trimmedFullName = (fullName || "").trim();
    if (!trimmedFullName) {
      return res.status(400).json({ message: "Full Name is required." });
    }

    const emailNormalized = (email || "").toString().trim().toLowerCase();
    if (!emailNormalized || !EMAIL_REGEX.test(emailNormalized)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }
    if (password.length > 50) {
      return res.status(400).json({ message: "Password cannot exceed 50 characters." });
    }

    const roleValue = role || "Employee";
    const statusValue = (status || "active").toString().toLowerCase();
    if (!["active", "inactive"].includes(statusValue)) {
      return res.status(400).json({ message: "Invalid employment status selection." });
    }

    // check duplicate
    const existing = await User.findOne({ email: emailNormalized });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let empId;
    if (roleValue === "Employee") {
      empId = await generateEmployeeId();
    }

    let employeeDetails = null;
    if (roleValue === "Employee") {
      const validation = validateEmployeeDetails(req.body);
      if (!validation.ok) {
        return res.status(400).json({ message: validation.message });
      }
      employeeDetails = validation.value;
    }

    // create user
    const userPayload = {
      fullName: trimmedFullName,
      email: emailNormalized,
      password: hashedPassword,
      role: roleValue,
      status: statusValue,
      ...(empId ? { empId } : {}),
    };

    const requestedJobTitle = (req.body.jobTitle || "").trim();
    if (employeeDetails?.jobTitle) {
      userPayload.jobTitle = employeeDetails.jobTitle;
    } else if (requestedJobTitle) {
      if (!TITLE_REGEX.test(requestedJobTitle)) {
        return res.status(400).json({ message: "Job Title can only contain letters, spaces, and hyphens." });
      }
      userPayload.jobTitle = requestedJobTitle;
    }

    const user = await User.create(userPayload);

    // if employee, create employee record
    if (roleValue === "Employee" && employeeDetails) {
      await Employee.create({
        user: user._id,
        empId: empId || user.empId,
        ...employeeDetails,
        accumulatedWorkingHours: 0, // Initialize the new field
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
      const empId = u.empId || empExtra.empId;

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
        empId,
        basicSalary: empExtra.basicSalary || 0,
        workingHours: empExtra.workingHours || 0,
        accumulatedWorkingHours: empExtra.accumulatedWorkingHours || 0,
        allowance: empExtra.allowance || 0,
        loan: empExtra.loan || 0,
        nationalId: empExtra.nationalId || "",
        gender: empExtra.gender || "",
        dateOfBirth: empExtra.dateOfBirth ? empExtra.dateOfBirth.toISOString() : null,
        address: empExtra.address || "",
        phoneNumber: empExtra.phoneNumber || "",
        department: empExtra.department || "",
        startDate: empExtra.startDate ? empExtra.startDate.toISOString() : null,
        employmentType: empExtra.employmentType || "",
        bankName: empExtra.bankName || "",
        bankAccountNumber: empExtra.bankAccountNumber || "",
        contactPhoneNumber: empExtra.contactPhoneNumber || "",
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
        user.nationalId = emp.nationalId;
        user.gender = emp.gender;
        user.dateOfBirth = emp.dateOfBirth;
        user.address = emp.address;
        user.phoneNumber = emp.phoneNumber;
        user.department = emp.department;
        user.startDate = emp.startDate;
        user.employmentType = emp.employmentType;
        user.bankName = emp.bankName;
        user.bankAccountNumber = emp.bankAccountNumber;
        user.contactPhoneNumber = emp.contactPhoneNumber;
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

    // Prevent manual updates to the generated employee id
    delete updates.empId;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const trimmedFullName = (updates.fullName || "").trim();
    if (!trimmedFullName) {
      return res.status(400).json({ message: "Full Name is required." });
    }

    const emailNormalized = (updates.email || "").toString().trim().toLowerCase();
    if (!emailNormalized || !EMAIL_REGEX.test(emailNormalized)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const statusValue = (updates.status || "active").toString().toLowerCase();
    if (!["active", "inactive"].includes(statusValue)) {
      return res.status(400).json({ message: "Invalid employment status selection." });
    }

    if (updates.password) {
      if (updates.password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long." });
      }
      if (updates.password.length > 50) {
        return res.status(400).json({ message: "Password cannot exceed 50 characters." });
      }
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const duplicateEmail = await User.findOne({
      email: emailNormalized,
      _id: { $ne: id },
    });
    if (duplicateEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let employeeDetails = null;
    if (existingUser.role === "Employee") {
      const validation = validateEmployeeDetails(updates);
      if (!validation.ok) {
        return res.status(400).json({ message: validation.message });
      }
      employeeDetails = validation.value;
    } else if (updates.jobTitle) {
      const requestedJobTitle = updates.jobTitle.trim();
      if (!TITLE_REGEX.test(requestedJobTitle)) {
        return res.status(400).json({ message: "Job Title can only contain letters, spaces, and hyphens." });
      }
      employeeDetails = { jobTitle: requestedJobTitle };
    }

    const userUpdatePayload = {
      fullName: trimmedFullName,
      email: emailNormalized,
      status: statusValue,
    };

    if (updates.password) {
      userUpdatePayload.password = updates.password;
    }

    if (employeeDetails?.jobTitle) {
      userUpdatePayload.jobTitle = employeeDetails.jobTitle;
    }

    const user = await User.findByIdAndUpdate(id, userUpdatePayload, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.role === "Employee" && employeeDetails) {
      const employeeUpdates = {
        ...employeeDetails,
      };

      if (user.empId) {
        employeeUpdates.empId = user.empId;
      }

      await Employee.findOneAndUpdate(
        { user: user._id },
        employeeUpdates,
        { upsert: true, new: true, runValidators: true }
      );
    }

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