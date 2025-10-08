// ✅ Corrected and Complete File: /backend/routes/application.routes.js
import { Router } from "express";
import {
  create,
  list,
  listByField,
} from "../controllers/application.controller.js"; // The new function 'listByField' is added to the import.

const router = Router();

// --- Temporarily disabled auth middleware for development ---
// TODO: Uncomment 'auth' before final deployment.
router.post("/", create);
router.get("/", list);

// --- New Route for fetching applications by field ID ---
// This is the missing route that your frontend needs.
router.get("/field/:fieldId", listByField);

// --- The default export remains as it was ---
export default router;
