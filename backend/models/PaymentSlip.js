import mongoose from "mongoose";

const PaymentSlipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    month: { type: Number, required: true, min: 1, max: 12, index: true },
    year: { type: Number, required: true, index: true },

    basicSalary: { type: Number, required: true, min: 0 },
    workingHours: { type: Number, default: 0, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    loan: { type: Number, default: 0, min: 0 },

    otTotal: { type: Number, default: 0, min: 0 },
    epf: { type: Number, default: 0, min: 0 },
    etf: { type: Number, default: 0, min: 0 },
    gross: { type: Number, default: 0, min: 0 },
    net: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true, versionKey: false }
);

PaymentSlipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("PaymentSlip", PaymentSlipSchema);
