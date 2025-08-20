// backend/routes/admin.routes.js
import express from "express";

// CORRECT: Import ONLY the functions that are actually exported from the controller.
// 'getLowStockTable' and 'getRecentOrdersTable' have been removed from this list.
import {
  getOverview,
  getStoreSummary,
  getSalesLast30Days,
  getInventoryByCategory,
  getTopSellers,
  getRecentOrders,
} from "../controllers/admin.controller.js";

const router = express.Router();

// --- Main Dashboard Routes ---
// Dashboard overview (cards + previews)
router.get("/overview", getOverview);
// Store summary cards
router.get("/store/summary", getStoreSummary);

// --- Chart-Specific Routes ---
router.get("/charts/sales-30d", getSalesLast30Days);
router.get("/charts/inventory-by-category", getInventoryByCategory);
router.get("/charts/top-sellers", getTopSellers);
router.get("/orders/recent", getRecentOrders);

// --- DELETED ROUTES ---
// The following routes have been removed because their controller functions no longer exist.
// This prevents the server from crashing on startup.
// router.get("/tables/low-stock", getLowStockTable);
// router.get("/tables/recent-orders", getRecentOrdersTable);

export default router;