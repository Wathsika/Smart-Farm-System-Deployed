import mongoose from "mongoose";

function generateTransactionId() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  const random = String(Math.floor(Math.random() * 90) + 10); // 2-digit random number

  return `TNX${year}${month}${day}${hour}${minute}${second}${random}`;
}

const transactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      default: generateTransactionId,
      unique: true,
      immutable: true,
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
