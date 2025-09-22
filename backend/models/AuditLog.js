import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { type: String, enum: ["ADD", "UPDATE", "DELETE"], required: true },
  collection: { type: String, required: true }, // e.g., "FinanceTransaction"
  recordId: { type: mongoose.Schema.Types.ObjectId, required: true }, // transaction id
  user: { type: String, required: true }, // username
  originalData: { type: Object }, // before update/delete
  newData: { type: Object }, // after insert/update
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("AuditLog", auditLogSchema);
