// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      unique: true,
      immutable: true,
      required: true, // must be provided by controller
    },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      default: "EXPENSE",
      required: true,
    },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: [0, "Amount must be >= 0"] },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
