// routes/inventory.routes.js
import express from "express";
import {
  adjustStock,
  lowStock,
} from "../controllers/inventory.controller.js";

const router = express.Router();

router.get("/low-stock", lowStock);
router.patch("/:productId/adjust", adjustStock);

export default router;
