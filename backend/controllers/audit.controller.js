import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error("Audit log fetch error:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};
