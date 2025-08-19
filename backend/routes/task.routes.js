import express from "express";
import { createTaskByAdmin,getAllTasksForAdmin,updateTaskByAdmin, deleteTaskByAdmin,generateTaskReport, getMyTasks, updateMyTaskStatus, } from "../controllers/task.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Middleware to protect all routes
router.use(requireAuth);

// Admin-only route to create tasks
router.get("/report", requireRole("Admin"), generateTaskReport);
router.post("/", requireRole("Admin"), createTaskByAdmin);
router.get("/", requireRole("Admin"), getAllTasksForAdmin);
router.put("/:id", requireRole("Admin"), updateTaskByAdmin);      // <-- Update task
router.delete("/:id", requireRole("Admin"), deleteTaskByAdmin);

// Employee-only routes
router.get("/my-tasks", requireRole("Employee"), getMyTasks);
router.patch("/:id/status", requireRole("Employee"), updateMyTaskStatus);

export default router;