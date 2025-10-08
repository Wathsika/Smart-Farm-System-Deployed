// ✅ Corrected and Complete file: /backend/routes/plan.routes.js
// The order of the GET routes has been fixed.

import { Router } from "express";
// Your import is already correct and includes `show`.
import {
  create,
  list,
  show,
  due,
  toggle,
  remove,
} from "../controllers/plan.controller.js";

const router = Router();

// --- Temporarily disabled auth middleware for development ---
// TODO: Uncomment 'auth' on all routes before final deployment.

// --- GENERAL ROUTES ---
router.post("/", create); // POST /api/plans
router.get("/", list); // GET /api/plans

// --- SPECIFIC ROUTES FIRST ---
// This specific GET route MUST come before the dynamic '/:id' route to work correctly.
router.get("/due", due); // GET /api/plans/due

// --- DYNAMIC ROUTES (with an ID) LAST ---
// These routes use a variable ID and should come after the specific '/due' route.
router.get("/:id", show); // GET /api/plans/some-id
router.patch("/:id/toggle", toggle); // PATCH /api/plans/some-id/toggle
router.delete("/:id", remove); // DELETE /api/plans/some-id

export default router;
