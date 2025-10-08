import { Router } from "express";
import {
  getPayrollSettings,
  updatePayrollSettings,
} from "../controllers/payrollSettings.controller.js";

const router = Router();

// /api/payroll/settings
router.get("/settings", getPayrollSettings);
router.put("/settings", updatePayrollSettings);

export default router;
