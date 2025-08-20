// models/Employee.js
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one employee per user
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    basicSalary: {
      type: Number,
      default: 0,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
