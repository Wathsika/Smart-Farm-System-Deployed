import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema(
  {
    // Leave request එක දාපු user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Leave වර්ගය (උදා: Sick, Casual)
    leaveType: {
      type: String,
      enum: ["Sick", "Casual", "Annual", "Maternity"],
      required: true,
    },
    // Leave එක පටන්ගන්න දවස
    startDate: {
      type: Date,
      required: true,
    },
    // Leave එක ඉවරවෙන දවස
    endDate: {
      type: Date,
      required: true,
    },
    // Leave එකට හේතුව
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    // Request එකේ තත්ත්වය (Status)
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    // Admin විසින් දාන සටහනක් (Approve/Reject කරනකොට)
    adminRemarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // createdAt සහ updatedAt fields auto add වෙන්න
);

const LeaveRequest = mongoose.model("LeaveRequest", LeaveRequestSchema);
export default LeaveRequest;