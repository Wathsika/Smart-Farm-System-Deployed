// --- START OF FILE chat.routes.js ---
import { Router } from "express";
import { handleChat } from "../controllers/chat.controller.js";

const router = Router();

router.get("/ping", (_req, res) => res.json({ ok: true, route: "chat" })); // sanity check
router.post("/", handleChat); // POST / (relative to where the router is mounted)

export default router;
// --- END OF FILE chat.routes.js ---