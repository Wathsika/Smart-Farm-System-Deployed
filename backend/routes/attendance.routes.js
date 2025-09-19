// routes/attendance.routes.js
import express from "express";
import {
  clockIn,
  clockOut,
  getAttendanceRecords,
  getTodaysAttendance, // 👈 dashboard එකට අවශ්‍ය import එක
  updateAttendanceByAdmin,
  deleteAttendanceByAdmin,
  createAttendanceByAdmin,
} from "../controllers/attendance.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// --- Employee Routes ---
router.post("/clock-in", requireAuth, requireRole("Employee", "Admin"), clockIn);
router.post("/clock-out", requireAuth, requireRole("Employee", "Admin"), clockOut);
// Dashboard එකේ "Today's Sessions" පෙන්වීමට අවශ්‍ය route එක
router.get("/today", requireAuth, requireRole("Employee", "Admin"), getTodaysAttendance);

// --- Shared Routes (For Admin/Reports) ---
router.get("/", requireAuth, requireRole("Admin", "Employee"), getAttendanceRecords);

// --- Admin Routes ---
router.post("/", requireAuth, requireRole("Admin"), createAttendanceByAdmin);
router.patch("/:id", requireAuth, requireRole("Admin"), updateAttendanceByAdmin);
router.delete("/:id", requireAuth, requireRole("Admin"), deleteAttendanceByAdmin);

export default router;