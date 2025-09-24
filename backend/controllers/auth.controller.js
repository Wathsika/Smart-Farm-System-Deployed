import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Get the secret from .env
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Fail fast if missing
if (!JWT_SECRET) {
  throw new Error(
    "❌ Missing JWT_SECRET in .env file. Please set it before starting the server."
  );
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  console.warn("⚠️ GOOGLE_CLIENT_ID not set. Google login is disabled.");
}
const HAS_NATIVE_FETCH = typeof fetch === "function";

// Customer self-signup (role forced to "Customer")
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "fullName, email, password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res
        .status(400)
        .json({ message: "A user with this email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const doc = await User.create({
      fullName,
      email,
      password: hashed,
      role: "Customer",
    });

    const user = doc.toObject();
    delete user.password;
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
      return res
        .status(400)
        .json({ message: "email and password are required" });

    const userDoc = await User.findOne({ email });
    if (!userDoc)
      return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, userDoc.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: userDoc._id, role: userDoc.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const user = userDoc.toObject();
    delete user.password;
    res.json({ message: "Logged in", token, user });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};

// Update profile details (requires current password confirmation)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, fullName, email, jobTitle } = req.body;

    if (!currentPassword || typeof currentPassword !== "string") {
      return res.status(400).json({ message: "Current password is required" });
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) return res.status(404).json({ message: "User not found" });

    const matches = await bcrypt.compare(currentPassword, userDoc.password);
    if (!matches) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const updates = {};
    if (typeof fullName === "string") updates.fullName = fullName;
    if (typeof email === "string") updates.email = email.toLowerCase();
    if (jobTitle !== undefined) updates.jobTitle = jobTitle;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No profile fields provided" });
    }

    const updatedDoc = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedDoc) return res.status(404).json({ message: "User not found" });

    const updatedUser = updatedDoc.toObject();
    delete updatedUser.password;

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};

// Change password (requires current password confirmation)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ message: "Passwords must be strings" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) return res.status(404).json({ message: "User not found" });

    const matches = await bcrypt.compare(currentPassword, userDoc.password);
    if (!matches) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const updatedDoc = await User.findByIdAndUpdate(
      userId,
      { password: hashed },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedDoc) return res.status(404).json({ message: "User not found" });

    const updatedUser = updatedDoc.toObject();
    delete updatedUser.password;

    res.json({ message: "Password updated successfully", user: updatedUser });
  } catch (e) {
    res.status(500).json({ message: "Server Error", error: e.message });
  }
};


export const googleLogin = async (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .json({ message: "Google login is not configured on the server." });
    }

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    if (!HAS_NATIVE_FETCH) {
      return res
        .status(500)
        .json({
          message: "Google login requires Node.js 18+ with fetch support.",
        });
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        credential
      )}`
    );

    if (!response.ok) {
      return res
        .status(401)
        .json({ message: "Invalid Google credential provided." });
    }

    const payload = await response.json();
    const {
      sub: googleId,
      email,
      name,
      picture,
      aud,
      email_verified: emailVerified,
    } = payload;

    if (aud !== GOOGLE_CLIENT_ID) {
      return res
        .status(401)
        .json({
          message: "Google credential is not meant for this application.",
        });
    }

    if (!email) {
      return res
        .status(400)
        .json({ message: "Google account is missing an email address." });
    }

    const isEmailVerified = emailVerified === true || emailVerified === "true";

    if (!isEmailVerified) {
      return res
        .status(401)
        .json({ message: "Google email address is not verified." });
    }

    let userDoc = await User.findOne({ email });

    if (!userDoc) {
      userDoc = await User.create({
        fullName: name || email,
        email,
        authProvider: "google",
        googleId,
        avatarUrl: picture,
        role: "Customer",
      });
    } else {
      let shouldSave = false;

      if (googleId && !userDoc.googleId) {
        userDoc.googleId = googleId;
        shouldSave = true;
      }

      if (picture && picture !== userDoc.avatarUrl) {
        userDoc.avatarUrl = picture;
        shouldSave = true;
      }

      if (shouldSave) {
        await userDoc.save();
      }
    }

    const token = jwt.sign(
      { id: userDoc._id, role: userDoc.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const user = userDoc.toObject();
    delete user.password;

    res.json({ message: "Logged in", token, user });
  } catch (e) {
    res
      .status(401)
      .json({ message: "Google authentication failed", error: e.message });
  }
};

