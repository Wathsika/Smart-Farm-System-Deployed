// backend/routes/milk.routes.js
import express from "express";
import mongoose from "mongoose";
import {
  createMilk,
  listMilk,
  getMilk,
  updateMilk,
  deleteMilk,
  farmDailyTotals,
  cowDailyTimeline,
  cowMonthlyStats,
} from "../controllers/milk.controller.js";

const router = express.Router();

// tiny helper to validate ObjectId parameters
const oid = (param = "id") => (req, res, next) => {
  const id = req.params[param];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid ObjectId for ${param}` });
  }
  next();
};

/* --- analytics first (more specific paths) --- */
router.get("/summary/farm/daily", farmDailyTotals);
router.get("/cow/:cowId/daily", oid("cowId"), cowDailyTimeline);
router.get("/cow/:cowId/monthly", oid("cowId"), cowMonthlyStats);

/* --- CRUD --- */
router.post("/", createMilk);
router.get("/", listMilk);
router.get("/:id", oid("id"), getMilk);
router.put("/:id", oid("id"), updateMilk);
router.delete("/:id", oid("id"), deleteMilk);

export default router;
