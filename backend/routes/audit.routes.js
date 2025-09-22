// routes/audit.routes.js
import { Router } from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.use(auth);

// GET /api/audit?date=YYYY-MM-DD&transactionId=<ObjectId>
router.get("/", getAuditLogs);

export default router;
