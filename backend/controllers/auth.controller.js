import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Get the secret from .env
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Fail fast if missing
if (!JWT_SECRET) {
  throw new Error("❌ Missing JWT_SECRET in .env file. Please set it before starting the server.");
}

// Customer self-signup (role forced to "Customer")
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email, password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "A user with this email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const doc = await User.create({
      fullName,
      email,
      password: hashed,
      role: "Customer",
    });

    const user = doc.toObject(); delete user.password;
    res.status(201).json({ message: "Customer registered successfully", user });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};

// Login (returns JWT)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    const userDoc = await User.findOne({ email });
    if (!userDoc) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, userDoc.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: userDoc._id, role: userDoc.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const user = userDoc.toObject(); delete user.password;
    res.json({ message: "Logged in", token, user });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};
