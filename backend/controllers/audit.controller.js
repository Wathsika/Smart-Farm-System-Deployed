// controllers/audit.controller.js
import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { date, transactionId } = req.query;

    const filter = {};
    if (transactionId) filter.recordId = transactionId;

    if (date) {
      // Interpret as local day [00:00, 24:00)
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.timestamp = { $gte: start, $lt: end };
    }

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
