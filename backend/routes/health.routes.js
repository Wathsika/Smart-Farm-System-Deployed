// backend/routes/health.routes.js
import express from "express";
import mongoose from "mongoose";
import {
  createHealth,
  listHealth,
  getHealth,
  updateHealth,
  deleteHealth,
  upcomingDue,
} from "../controllers/health.controller.js";

const router = express.Router();
const oid = (param = "id") => (req, res, next) => {
  const id = req.params[param];
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: `Invalid ObjectId for ${param}` });
  next();
};

/* analytics */
router.get("/due", upcomingDue);

/* CRUD */
router.post("/", createHealth);
router.get("/", listHealth);
router.get("/:id", oid("id"), getHealth);
router.put("/:id", oid("id"), updateHealth);
router.delete("/:id", oid("id"), deleteHealth);

router.get("/upcoming-due", upcomingDue);

export default router;
