
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    empId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 10,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    employmentType: {
      type: String,
      enum: ["Permanent", "Contract", "Intern"],
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
    bankName: {
      type: String,
      trim: true,
    },
    bankAccountNumber: {
      type: String,
      trim: true,
    },
    contactPhoneNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;