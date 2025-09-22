import { Router } from "express";
import {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

router.post("/", createTransaction); // Create (body must include type: "INCOME" | "EXPENSE")
router.get("/", listTransactions); // List all (optional ?type=INCOME|EXPENSE&from=YYYY-MM-DD&to=YYYY-MM-DD)
router.get("/:id", getTransaction); // Read one
router.put("/:id", updateTransaction); // Update
router.delete("/:id", deleteTransaction); // Delete

export default router;
