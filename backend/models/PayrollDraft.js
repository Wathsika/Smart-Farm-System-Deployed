import mongoose from "mongoose";

const DraftItemSchema = new mongoose.Schema(
  {
    employee: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },
      empId: String,
      name: String,
    },
    // inputs copied from Employee (and optional employee fields)
    basicSalary: { type: Number, required: true, min: 0 },
    workingHours: { type: Number, default: 0, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    loan: { type: Number, default: 0, min: 0 },

    // computed by rules
    otTotal: { type: Number, default: 0, min: 0 },
    epf: { type: Number, default: 0, min: 0 },
    etf: { type: Number, default: 0, min: 0 },
    gross: { type: Number, default: 0, min: 0 },
    net: { type: Number, default: 0, min: 0 },
    status: { type: String, default: "PENDING" },
  },
  { _id: false }
);

const PayrollDraftSchema = new mongoose.Schema(
  {
    draftKey: { type: String, required: true, index: true }, // a client-provided uuid or random string
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    items: { type: [DraftItemSchema], default: [] },

    // Expire drafts automatically after e.g. 24h
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 3600 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("PayrollDraft", PayrollDraftSchema);
