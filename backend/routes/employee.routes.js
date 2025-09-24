import { Router } from "express";
import { listEmployeesMinimal } from "../controllers/employee.controller.js";
const router = Router();

router.get("/min", listEmployeesMinimal);

export default router;
