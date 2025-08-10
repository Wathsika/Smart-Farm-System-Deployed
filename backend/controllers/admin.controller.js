import Product from "../models/Product.js";
// Since we have removed the Order model for now, we won't import it.

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

        // --- Placeholders for Future Data (when you have Order/User models) ---
        const orderCount = 0;
        const customers = 0;
        const revenueAllTime = 0;

        res.status(200).json({
            productCount,
            orderCount,
            customers,
            revenueAllTime,
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
    // When you have an Order model, your query will go here.
    // const rows = await Order.aggregate([...]);
    res.status(200).json([]); // Return empty data
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