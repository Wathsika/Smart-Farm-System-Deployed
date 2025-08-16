import { Router } from "express";
import {
  createExpense,
  listExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";

const router = Router();

router.post("/", createExpense); // Create
router.get("/", listExpenses); // List all
router.get("/:id", getExpense); // Read one
router.patch("/:id", updateExpense); // Update
router.delete("/:id", deleteExpense); // Delete

export default router;
