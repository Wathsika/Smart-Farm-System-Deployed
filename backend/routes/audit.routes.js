// routes/auditRoutes.js
import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";

const router = express.Router();

// GET /api/audit
router.get("/", getAuditLogs);

export default router;
