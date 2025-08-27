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

// Add Employee (adds to both Users + Employees tables)
router.post("/employees", async (req, res) => {
  try {
    const { fullName, email, password, jobTitle, basicSalary } = req.body;

    // 1️⃣ Create user
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      password: hashed,
      role: "Employee",
    });
    await user.save();


// --- Chart-Specific Routes ---
router.get("/charts/sales-30d", getSalesLast30Days);
router.get("/charts/inventory-by-category", getInventoryByCategory);
router.get("/charts/top-sellers", getTopSellers);
router.get("/orders/recent", getRecentOrders);


    res.status(201).json({ message: "Employee created", user, employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
