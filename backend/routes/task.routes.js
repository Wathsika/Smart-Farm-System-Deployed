import express from "express";
import { createTaskByAdmin, getMyTasks, updateMyTaskStatus } from "../controllers/task.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Middleware to protect all routes
router.use(requireAuth);

// Admin-only route to create tasks
router.post("/", requireRole("Admin"), createTaskByAdmin);

// Employee-only routes
router.get("/my-tasks", requireRole("Employee"), getMyTasks);
router.patch("/:id/status", requireRole("Employee"), updateMyTaskStatus);

export default router;