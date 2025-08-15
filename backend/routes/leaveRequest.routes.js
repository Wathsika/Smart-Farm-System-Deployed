import express from "express";
import {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveRequestStatus,
  deleteLeaveRequest,
} from "../controllers/leaveRequest.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Middleware to protect all routes
router.use(requireAuth);

// Employee & Admin routes
router.post("/", requireRole("Employee", "Admin"), createLeaveRequest);
router.get("/", requireRole("Employee", "Admin"), getLeaveRequests);

// Admin-only routes
router.patch("/:id/status", requireRole("Admin"), updateLeaveRequestStatus);
router.delete("/:id", requireRole("Admin"), deleteLeaveRequest);

export default router;