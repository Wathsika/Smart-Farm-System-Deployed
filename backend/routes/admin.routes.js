// routes/admin.routes.js
import express from "express";
import {
  getOverview,
  getSalesLast30Days,
  getInventoryByCategory,
  getLowStockTable,
  getRecentOrdersTable,
  getStoreSummary,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Dashboard overview (cards + previews)
router.get("/overview", getOverview);

// Store summary cards
router.get("/store/summary", getStoreSummary);

// Charts
router.get("/charts/sales-30d", getSalesLast30Days);
router.get("/charts/inventory-by-category", getInventoryByCategory);

// Tables
router.get("/tables/low-stock", getLowStockTable);
router.get("/tables/recent-orders", getRecentOrdersTable);

export default router;
