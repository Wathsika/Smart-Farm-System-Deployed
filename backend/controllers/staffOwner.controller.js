import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const addUserByAdmin = async (req, res) => {
  try {
    const { fullName, email, password, role, jobTitle } = req.body;
    if (!fullName || !email || !password || !role)
      return res.status(400).json({ message: "fullName, email, password, role are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const doc = await User.create({ fullName, email, password: hashed, role, jobTitle });
    const user = doc.toObject(); delete user.password;
    res.status(201).json({ message: `User (${role}) created`, user });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { q = "", role, page = 1, limit = 10 } = req.query;
    const filter = {
      ...(q && { $or: [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { jobTitle: { $regex: q, $options: "i" } },
      ]}),
      ...(role && { role }),
    };
    const pg = Math.max(parseInt(page), 1);
    const lm = Math.min(Math.max(parseInt(limit), 1), 100);

    const [items, total] = await Promise.all([
      User.find(filter).select("-password").sort("-createdAt").skip((pg - 1) * lm).limit(lm),
      User.countDocuments(filter),
    ]);

    res.json({ items, total, page: pg, pages: Math.ceil(total / lm) });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { fullName, email, role, jobTitle, password } = req.body;
    const updates = { fullName, email, role, jobTitle };

    if (password) updates.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated", user });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const del = await User.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};
