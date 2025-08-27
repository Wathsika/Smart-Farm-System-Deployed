import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Discount from "../models/Discount.js";

// --- HELPER FUNCTIONS ---
// These are useful for date-based queries, which you can use later.
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


// --- 1. DASHBOARD OVERVIEW: Cards + Quick Lists ---
// Provides the main statistics for the primary admin dashboard.
export const getOverview = async (req, res, next) => {
  try {
    // --- Card Statistics ---
    const productCount = await Product.countDocuments({});
    
    // Count products where stock is low or out.
    const lowStockCount = await Product.countDocuments({ 
        $expr: { $lte: ["$stock.qty", "$stock.lowStockThreshold"] } 
    });

    // --- List Previews ---
    // Get a preview of up to 5 low-stock products.
    const lowStockPreview = await Product.find({
        $expr: { $lte: ["$stock.qty", "$stock.lowStockThreshold"] }
    }).limit(5).sort({ 'stock.qty': 1 });

    // --- Placeholders for Future Data (when you have an Order model) ---
    const orderCount = 0; 
    const revenueToday = 0; 
    const recentOrders = [];


    res.status(200).json({
      cards: {
        productCount,
        lowStockCount,
        orderCount,
        revenueToday,
      },
      lists: {
        lowStockPreview,
        recentOrders,
      },
    });

  } catch (err) {
    console.error("Error fetching overview data:", err);
    // Pass the error to your centralized error handler
    next(err);
  }
};


// --- 2. STORE SUMMARY: Cards for the "Store" section ---
// Provides general stats related to e-commerce functionality.
export const getStoreSummary = async (req, res, next) => {
    try {
        const productCount = await Product.countDocuments({});
         const lowStockCount = await Product.countDocuments({
            $expr: { $lte: ["$stock.qty", "$stock.lowStockThreshold"] }
        });

        const todayStart = startOfToday();
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const [ordersToday, ordersYesterday] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: todayStart } }),
            Order.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: todayStart } })
        ]);

        const revenueAgg = await Promise.all([
            Order.aggregate([
                { $match: { createdAt: { $gte: todayStart } } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ])
        ]);

        const revenueToday = revenueAgg[0][0]?.total || 0;
        const revenueYesterday = revenueAgg[1][0]?.total || 0;

        const ordersTodayChangePct = ordersYesterday
            ? ((ordersToday - ordersYesterday) / ordersYesterday) * 100
            : null;
        const revenueTodayChangePct = revenueYesterday
            ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100
            : null;

        const customers = (await Order.distinct("customer.email")).length;
        const now = new Date();
        const activeDiscounts = await Discount.countDocuments({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        res.status(200).json({
            productCount,
             lowStockCount,
            ordersToday,
            ordersTodayChangePct,
            customers,
            revenueToday,
            revenueTodayChangePct,
            activeDiscounts,
        });
    } catch (err) {
        console.error("Error fetching store summary:", err);
        next(err);
    }
};


// --- 3. CHARTS: Sales for the Last 30 Days ---
// This requires an Order model. For now, it returns an empty array to prevent frontend errors.
export const getSalesLast30Days = async (req, res, next) => {
  try {
   const startDate = daysAgo(29);
    startDate.setHours(0, 0, 0, 0);
    const rows = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.status(200).json(rows.map(r => ({ date: r._id, revenue: r.revenue, orders: r.orders })));
  } catch (err) {
    console.error("Error fetching sales chart data:", err);
    next(err);
  }
};


// --- 4. CHARTS: Inventory Value by Category ---
// Calculates the total monetary value and stock count for each product category.
export const getInventoryByCategory = async (req, res, next) => {
  try {
    const rows = await Product.aggregate([
      {
        $group: {
          _id: "$category", // Group by the product's category field
          // For each category, calculate the total value by multiplying stock quantity by price
          value: { $sum: { $multiply: ["$stock.qty", "$price"] } }, 
          // Also calculate the total number of items in stock for that category
          stock: { $sum: "$stock.qty" },
        },
      },
      { $sort: { value: -1 } }, // Sort by the highest value category
    ]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching inventory by category:", err);
    next(err);
  }
  };

// --- 5. CHARTS: Top Selling Products ---
export const getTopSellers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || "5", 10);
    const rows = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          qty: { $sum: "$orderItems.qty" },
          revenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } }
        }
      },
      { $sort: { qty: -1 } },
      { $limit: limit }
    ]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching top sellers:", err);
    next(err);
  }
};

// --- 6. Recent Orders ---
export const getRecentOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || "5", 10);
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(limit);
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching recent orders:", err);
    next(err);
  }
};