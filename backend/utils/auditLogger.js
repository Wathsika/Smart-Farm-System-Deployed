import AuditLog from "../models/AuditLog.js";

export async function logAudit({
  action,
  collection,
  recordId,
  user,
  originalData,
  newData,
}) {
  try {
    await AuditLog.create({
      action,
      collection,
      recordId,
      user,
      originalData,
      newData,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
}
