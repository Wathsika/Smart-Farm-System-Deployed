import { Router } from "express";
import {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

// Create (body must include type: "INCOME" | "EXPENSE")
router.post("/transactions", async (req, res) => {
  try {
    const transaction = await FinanceTransaction.create(req.body);

    await logAudit({
      action: "ADD",
      collection: "FinanceTransaction",
      recordId: transaction._id,
      user: req.user?.username || "system",
      newData: transaction.toObject(),
    });

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", listTransactions); // List all (optional ?type=INCOME|EXPENSE&from=YYYY-MM-DD&to=YYYY-MM-DD)
router.get("/:id", getTransaction); // Read one

// Update
router.put("/transactions/:id", async (req, res) => {
  try {
    const oldRecord = await FinanceTransaction.findById(req.params.id);
    if (!oldRecord)
      return res.status(404).json({ error: "Transaction not found" });

    const updated = await FinanceTransaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    await logAudit({
      action: "UPDATE",
      collection: "FinanceTransaction",
      recordId: updated._id,
      user: req.user?.username || "system",
      originalData: oldRecord.toObject(),
      newData: updated.toObject(),
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete("/transactions/:id", async (req, res) => {
  try {
    const record = await FinanceTransaction.findById(req.params.id);
    if (!record)
      return res.status(404).json({ error: "Transaction not found" });

    await record.deleteOne();

    await logAudit({
      action: "DELETE",
      collection: "FinanceTransaction",
      recordId: record._id,
      user: req.user?.username || "system",
      originalData: record.toObject(),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
