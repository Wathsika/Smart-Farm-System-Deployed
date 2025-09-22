import AuditLog from "../models/AuditLog.js";

export async function logAudit({
  action,
  recordId,
  transactionId, // <-- add this here
  user,
  originalData,
  newData,
}) {
  try {
    await AuditLog.create({
      action,
      recordId,
      transactionId, // <-- correctly saved now
      user,
      originalData,
      newData,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
}
