// backend/controllers/report.controller.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Sales totals per day
export const getSalesReport = async (req, res, next) => {
  try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalPrice" }, // change field name if yours differs
        },
      },
      { $project: { _id: 0, date: "$_id", total: 1 } },
      { $sort: { date: 1 } },
    ]);
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

// Inventory (product -> stock qty)
export const getInventoryReport = async (req, res, next) => {
  try {
    const products = await Product.find({}, { name: 1, "stock.qty": 1 }).lean();
    const inventory = products.map((p) => ({
      item: p.name,
      quantity: p?.stock?.qty ?? 0,
    }));
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

// Customers summary (orders count per customer)
export const getCustomerReport = async (req, res, next) => {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$customer.email",
          name: { $first: "$customer.name" },
          orders: { $sum: 1 },
        },
      },
      { $project: { _id: 0, email: "$_id", name: 1, orders: 1 } },
      { $sort: { name: 1 } },
    ]);
    res.json(customers);
  } catch (err) {
    next(err);
  }
};

export default { getSalesReport, getInventoryReport, getCustomerReport };
