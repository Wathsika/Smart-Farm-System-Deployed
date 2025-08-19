import express from "express";
import mongoose from "mongoose";
import {
  createBreeding,
  listBreeding,
  getBreeding,
  updateBreeding,
  deleteBreeding,
  upcomingDue,
  repeatBreeders,
} from "../controllers/breeding.controller.js";

const router = express.Router();

const oid = (param = "id") => (req, res, next) => {
  const id = req.params[param];
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: `Invalid ObjectId for ${param}` });
  next();
};

/* Analytics / helpers */
router.get("/due", upcomingDue);
router.get("/repeat-breeders", repeatBreeders);

/* CRUD */
router.post("/", createBreeding);
router.get("/", listBreeding);
router.get("/:id", oid("id"), getBreeding);
router.put("/:id", oid("id"), updateBreeding);
router.delete("/:id", oid("id"), deleteBreeding);

export default router;
