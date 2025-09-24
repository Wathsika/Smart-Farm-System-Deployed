// models/User.js (formerly Staff.js)

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      index: true,
      sparse: true,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ["Customer", "Employee", "Admin"], // The allowed roles
      required: true,
      default: "Customer",
    },
    // This field is for Employees only
    jobTitle: {
      type: String,
      trim: true,
      // Make this field required only IF the role is 'Employee'
      required: function () {
        return this.role === "Employee";
      },
    },
  },
  {
    timestamps: true,
  }
);

// We name the model 'User'. Mongoose will automatically create a collection named 'users'.
const User = mongoose.model("User", userSchema);

export default User;