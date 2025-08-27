import express from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { getMyPerformance } from "../controllers/performance.controller.js";

const router = express.Router();

router.get("/my", requireAuth, requireRole("Employee"), getMyPerformance);

export default router;
