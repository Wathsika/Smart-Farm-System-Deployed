import express from "express";
import {
  clockIn,
  clockOut,
  getAttendanceRecords,
  updateAttendanceByAdmin,
  deleteAttendanceByAdmin,
  createAttendanceByAdmin,
} from "../controllers/attendance.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// --- Employee Routes ---
// Employees can only clock in/out for themselves.
router.post("/clock-in", requireAuth, requireRole("Employee", "Admin"), clockIn);
router.post("/clock-out", requireAuth, requireRole("Employee", "Admin"), clockOut);

// --- Shared Routes ---
// All authenticated users can view records, but controller restricts by role.
router.get("/", requireAuth, requireRole("Admin", "Employee"), getAttendanceRecords);

// --- Admin Routes ---
// Admin can manually create, update or delete records
router.post("/", requireAuth, requireRole("Admin"), createAttendanceByAdmin);
router.patch("/:id", requireAuth, requireRole("Admin"), updateAttendanceByAdmin);
router.delete("/:id", requireAuth, requireRole("Admin"), deleteAttendanceByAdmin);

export default router;
