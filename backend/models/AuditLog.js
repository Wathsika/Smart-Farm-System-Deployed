import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { type: String, enum: ["ADD", "UPDATE", "DELETE"], required: true },
  collection: { type: String, required: true },
  recordId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Mongo _id
  transactionId: { type: String }, // ✅ custom TNXxxxx id
  user: { type: String, required: true },
  originalData: { type: Object },
  newData: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("AuditLog", auditLogSchema);
