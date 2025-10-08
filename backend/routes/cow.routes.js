import express from "express";
import {
  addCow,
  listCows,
  getCow,
  updateCow,
  deleteCow,
  regenerateCowQR, 
} from "../controllers/cow.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

//  List all cows
router.get("/", listCows);

// Add new cow with photo upload
router.post("/", upload.single("photo"), addCow);

//  Get single cow by ID
router.get("/:id", getCow);

//  Update cow details
router.put("/:id", upload.single("photo"), updateCow);

//  Delete cow
router.delete("/:id", deleteCow);

//  Regenerate QR code for a cow 
router.get("/:id/regenerate", regenerateCowQR);

export default router;
