import express from "express";
import {
  clockIn,
  clockOut,
  getAttendanceRecords,
  updateAttendanceByAdmin,
  deleteAttendanceByAdmin,
  createAttendanceByAdmin, // 1. IMPORT the new function
} from "../controllers/attendance.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("Admin"), createAttendanceByAdmin);
// --- Employee Routes ---
// Employees can only clock in/out for themselves.
router.post("/clock-in", requireAuth, requireRole("Employee", "Admin"), clockIn);
router.post("/clock-out", requireAuth, requireRole("Employee", "Admin"), clockOut);


// --- Shared & Admin Routes ---

// All authenticated users can view records, but the controller logic restricts access.
router.get("/", requireAuth, requireRole("Admin", "Employee"), getAttendanceRecords);

// Only Admins can manually update or delete records.
router.patch("/:id", requireAuth, requireRole("Admin"), updateAttendanceByAdmin);
router.delete("/:id", requireAuth, requireRole("Admin"), deleteAttendanceByAdmin);

export default router;