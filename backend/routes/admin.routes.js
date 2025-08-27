import express from "express";

import {
  getOverview,
  getStoreSummary,
  getSalesLast30Days,
  getInventoryByCategory,
  getTopSellers,
  getRecentOrders,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/overview", getOverview);
router.get("/store/summary", getStoreSummary);
router.get("/charts/sales-30d", getSalesLast30Days);
router.get("/charts/inventory-by-category", getInventoryByCategory);
router.get("/charts/top-sellers", getTopSellers);
router.get("/orders/recent", getRecentOrders);

export default router;