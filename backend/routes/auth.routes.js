// routes/auth.routes.js
import express from "express";
import { signup, login, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.put("/profile", requireAuth, updateProfile);
router.put("/profile/password", requireAuth, changePassword);
export default router;
