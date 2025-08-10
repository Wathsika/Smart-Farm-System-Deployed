// controllers/admin.controller.js
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Order from "../models/Order.js";

// Cards + quick lists (for dashboard landing)
export const getOverview = async (_req, res, next) => {
  try {
    const [productCount, lowStockCount, orderCount, revenueTodayAgg, recentOrders, recentProducts] =
      await Promise.all([
        Product.countDocuments({}),
        Inventory.countDocuments({ $expr: { $lt: ["$stock", "$lowStockThreshold"] } }),
        Order.countDocuments({}),
        // revenue today (PAID)
        Order.aggregate([
          { $match: { status: "PAID", createdAt: { $gte: startOfToday() } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.find({}).sort({ createdAt: -1 }).limit(5).select("total status createdAt").lean(),
        Product.find({}).sort({ createdAt: -1 }).limit(5).select("name price createdAt").lean(),
      ]);

    // inventory value = sum(price * stock)
    const inventoryValueAgg = await Inventory.aggregate([
      { $lookup: { from: "products", localField: "product", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $group: { _id: null, value: { $sum: { $multiply: ["$stock", "$p.price"] } } } },
    ]);

    const data = {
      cards: {
        productCount,
        lowStockCount,
        orderCount,
        revenueToday: revenueTodayAgg[0]?.total || 0,
        inventoryValue: inventoryValueAgg[0]?.value || 0,
      },
      lists: {
        recentOrders,
        recentProducts,
        lowStockPreview: await Inventory.find({
          $expr: { $lt: ["$stock", "$lowStockThreshold"] },
        })
          .populate("product", "name price")
          .limit(5)
          .lean(),
      },
    };

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Charts: last 30 days sales (PAID orders)
export const getSalesLast30Days = async (_req, res, next) => {
  try {
    const since = daysAgo(30);
    const rows = await Order.aggregate([
      { $match: { status: "PAID", createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Charts: inventory value by category
export const getInventoryByCategory = async (_req, res, next) => {
  try {
    const rows = await Inventory.aggregate([
      { $lookup: { from: "products", localField: "product", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      {
        $group: {
          _id: "$p.category",
          value: { $sum: { $multiply: ["$stock", "$p.price"] } },
          stock: { $sum: "$stock" },
        },
      },
      { $sort: { value: -1 } },
    ]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Tables: low stock (full list, paginated)
export const getLowStockTable = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Inventory.find({ $expr: { $lt: ["$stock", "$lowStockThreshold"] } })
        .populate("product", "name sku price category")
        .sort({ stock: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inventory.countDocuments({ $expr: { $lt: ["$stock", "$lowStockThreshold"] } }),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Tables: recent orders (paginated)
export const getRecentOrdersTable = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Order.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("total status customerEmail createdAt")
        .lean(),
      Order.countDocuments({}),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Store card summary (products, orders, customers, revenue)
export const getStoreSummary = async (_req, res, next) => {
  try {
    const [productCount, orderCount, customerAgg, revenueAgg] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([{ $group: { _id: "$customerEmail" } }, { $count: "customers" }]),
      Order.aggregate([{ $match: { status: "PAID" } }, { $group: { _id: null, revenue: { $sum: "$total" } } }]),
    ]);

    res.json({
      productCount,
      orderCount,
      customers: customerAgg[0]?.customers || 0,
      revenueAllTime: revenueAgg[0]?.revenue || 0,
    });
  } catch (err) {
    next(err);
  }
};

/** helpers */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
