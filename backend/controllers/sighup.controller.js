import bcrypt from "bcryptjs";
import User from "../models/User.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sighUp(req, res) {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName?.trim())
      return res.status(400).json({ message: "First name is required" });
    if (!lastName?.trim())
      return res.status(400).json({ message: "Last name is required" });
    if (!email?.trim() || !EMAIL_REGEX.test(email))
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    if (!password || password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    if (!confirmPassword || confirmPassword !== password)
      return res.status(400).json({ message: "Passwords do not match" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ message: "Email is already registered" });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "Customer", // force Customer for this public flow
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("sighUp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
