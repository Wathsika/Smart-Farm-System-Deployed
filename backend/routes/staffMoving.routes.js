import express from "express";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Add Employee (adds to both Users + Employees tables)
router.post("/employees", async (req, res) => {
  try {
    const { fullName, email, password, jobTitle, basicSalary } = req.body;

    // 1️⃣ Create user
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      password: hashed,
      role: "Employee",
    });
    await user.save();

    // 2️⃣ Create employee record
    const employee = new Employee({
      user: user._id,
      jobTitle,
      basicSalary,
    });
    await employee.save();

    res.status(201).json({ message: "Employee created", user, employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
