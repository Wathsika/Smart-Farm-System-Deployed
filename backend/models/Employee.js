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
    workingHours: { // This field will now represent standard/expected working hours
      type: Number,
      default: 0,
    },
    // NEW FIELD: To accumulate actual hours worked from attendance
    accumulatedWorkingHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    allowance: {
      // Ensure allowance is defined
      type: Number,
      default: 0,
      min: 0,
    },
    loan: {
      // Ensure loan is defined
      type: Number,
      default: 0,

      min: 0,
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;