import { Router } from "express";
import {
  getPayrollSettings,
  updatePayrollSettings,
} from "../controllers/payrollSettings.controller.js";

const router = Router();

// /api/payroll/settings
router.get("/payroll/settings", getPayrollSettings);
router.put("/payroll/settings", updatePayrollSettings);

export default router;
