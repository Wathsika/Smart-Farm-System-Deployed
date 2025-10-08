// /backend/routes/input.routes.js
import { Router } from "express";
import {
  create,
  list,
  one,
  update,
  remove,
} from "../controllers/input.controller.js";

const router = Router();

// --- Temporarily disabled auth middleware for development ---
router.post("/", create);
router.get("/", list);
router.get("/:id", one);
router.put("/:id", update);
router.delete("/:id", remove);
// --- End of temporarily disabled section ---

export default router;
