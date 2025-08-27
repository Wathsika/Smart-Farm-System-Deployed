// controllers/staffOwner.controller.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

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
 */
export const listUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const query = { role: "Employee" }; // 🔹 Only employees

    if (q) {
      query.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { jobTitle: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const employees = await User.find(query)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(query);

    // attach extra fields from Employee table
    const userIds = employees.map((u) => u._id);
    const empDetails = await Employee.find({ user: { $in: userIds } }).lean();
    const empMap = {};
    empDetails.forEach((e) => {
      empMap[e.user.toString()] = e;
    });

    const items = employees.map((u) => ({
      ...u,
      basicSalary: empMap[u._id]?.basicSalary || null,
      workingHours: empMap[u._id]?.workingHours || null,
    }));

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
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
        status: updates.status,
        jobTitle: updates.jobTitle,
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update Employee extra fields
    await Employee.findOneAndUpdate(
      { user: user._id },
      {
        jobTitle: updates.jobTitle,
        basicSalary: updates.basicSalary,
        workingHours: updates.workingHours,
      },
      { upsert: true, new: true }
    );

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

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("❌ deleteUserByAdmin error:", err);
    res.status(500).json({ message: "Failed to delete employee" });
  }
};
