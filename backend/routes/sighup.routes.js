// /routes/sighup.routes.js
import { Router } from "express";
import { sighUp } from "../controllers/sighup.controller.js";

const router = Router();

// POST /api/auth/sighup  → public registration
router.post("/sighup", sighUp);

export default router;
