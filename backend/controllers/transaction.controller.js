import Transaction from "../models/Transaction.js";
import { logAudit } from "../utils/auditLogger.js";
import { generateTransactionId } from "../utils/transactionId.js";

/* ---------- helpers ---------- */
function monthRange(ym) {
  const [y, m] = (ym || "").split("-").map(Number);
  if (!y || !m) return null;
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end };
}

function looksLikeObjectId(str) {
  return /^[a-f\d]{24}$/i.test(str);
}

function idFilter(idOrTxnId) {
  return looksLikeObjectId(idOrTxnId)
    ? { $or: [{ _id: idOrTxnId }, { transaction_id: idOrTxnId }] }
    : { transaction_id: idOrTxnId };
}

/* ---------- CREATE ---------- */
export const createTransaction = async (req, res) => {
  try {
    const { type, date, category, amount, description } = req.body;

    if (!category?.trim())
      return res.status(400).json({ message: "category is required" });
    if (amount === undefined || Number.isNaN(Number(amount)))
      return res.status(400).json({ message: "amount is required" });
    if (description === undefined)
      return res.status(400).json({ message: "description is required" });

    const payload = {
      transaction_id: generateTransactionId(),
      type: type || "EXPENSE",
      category: category.trim(),
      amount: Number(amount),
      description: String(description).trim(),
    };

    if (date) {
      const d = new Date(date);
      if (!isNaN(d)) payload.date = d;
    }

    const doc = await Transaction.create(payload);

    // --- Audit log ---
    await logAudit({
      action: "ADD",
      recordId: doc._id,
      transactionId: doc.transaction_id, // now properly stored
      user: req.user?.email || req.user?.username || "system",
      newData: doc.toObject(),
    });

    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* ---------- LIST (?type=, ?month=YYYY-MM, ?q=, ?tid=) ---------- */
export const listTransactions = async (req, res) => {
  try {
    const { type, month, q, tid } = req.query;
    const filter = {};

    if (type && ["INCOME", "EXPENSE"].includes(type)) filter.type = type;

    if (month) {
      const r = monthRange(month);
      if (r) filter.date = { $gte: r.start, $lt: r.end };
    }

    if (tid?.trim()) {
      filter.transaction_id = tid.trim();
    } else if (q?.trim()) {
      const rx = new RegExp(q.trim(), "i");
      filter.$or = [
        { category: rx },
        { description: rx },
        { transaction_id: rx },
      ];
    }

    const items = await Transaction.find(filter).sort({
      date: -1,
      createdAt: -1,
    });

    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ---------- GET ONE (by _id OR transaction_id) ---------- */
export const getTransaction = async (req, res) => {
  try {
    const filter = idFilter(req.params.id);
    const item = await Transaction.findOne(filter);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ---------- UPDATE ---------- */ /* ---------- UPDATE ---------- */
export const updateTransaction = async (req, res) => {
  try {
    const { type, date, category, amount, description, transaction_id } =
      req.body;

    if (transaction_id !== undefined) {
      return res.status(400).json({
        message: "transaction_id is immutable and cannot be changed",
      });
    }

    const update = {};
    if (type !== undefined) update.type = type;
    if (date !== undefined) {
      const d = new Date(date);
      if (!isNaN(d)) update.date = d;
      else return res.status(400).json({ message: "Invalid date" });
    }
    if (category !== undefined) update.category = String(category).trim();
    if (amount !== undefined) {
      const num = Number(amount);
      if (Number.isNaN(num)) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      update.amount = num;
    }
    if (description !== undefined)
      update.description = String(description).trim();

    const filter = idFilter(req.params.id);

    const oldRecord = await Transaction.findOne(filter);
    if (!oldRecord) return res.status(404).json({ message: "Not found" });

    const item = await Transaction.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, runValidators: true }
    );

    // --- Audit log ---
    await logAudit({
      action: "UPDATE",
      recordId: item._id,
      transactionId: item.transaction_id,
      user: req.user?.email || req.user?.username || "system",
      originalData: oldRecord.toObject(),
      newData: item.toObject(),
    });

    res.json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* ---------- DELETE ---------- */
export const deleteTransaction = async (req, res) => {
  try {
    const filter = idFilter(req.params.id);
    const item = await Transaction.findOneAndDelete(filter);
    if (!item) return res.status(404).json({ message: "Not found" });

    // --- Audit log ---
    await logAudit({
      action: "DELETE",
      recordId: item._id,
      transactionId: item.transaction_id,
      user: req.user?.email || req.user?.username || "system",
      originalData: item.toObject(),
    });

    res.json({
      message: "Deleted",
      id: item._id,
      transaction_id: item.transaction_id,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
