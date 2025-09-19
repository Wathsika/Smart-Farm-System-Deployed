import { Router } from "express";
import {
  previewPayroll,
  commitPayroll,
} from "../controllers/payroll.controller.js";
const router = Router();

router.post("/preview", previewPayroll); // calculate & store draft
router.post("/commit", commitPayroll); // save to PaymentSlip

export default router;
