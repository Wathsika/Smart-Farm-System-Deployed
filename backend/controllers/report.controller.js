// backend/controllers/report.controller.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const getDateRangeBounds = (range) => {
  const normalizedRange = typeof range === "string" ? range.toLowerCase() : "";
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start;

  switch (normalizedRange) {
    case "today": {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    }
    case "week": {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start.setHours(0, 0, 0, 0);
      const dayOfWeek = start.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
      start.setDate(start.getDate() - diff);
      break;
    }
    case "month": {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "all":
    default:
      return null;
  }

  if (start) {
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
};

const buildDateMatchStage = (range) => {
  const bounds = getDateRangeBounds(range);
  if (!bounds) return null;

  const match = {};
  if (bounds.start) match.$gte = bounds.start;
  if (bounds.end) match.$lte = bounds.end;

  if (!Object.keys(match).length) return null;

  return { $match: { createdAt: match } };
};

// Sales totals per day
export const getSalesReport = async (req, res, next) => {
  try {
    const pipeline = [];
    const matchStage = buildDateMatchStage(req.query.range);
    if (matchStage) {
      pipeline.push(matchStage);
    }

    pipeline.push(
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalPrice" }, // change field name if yours differs
        },
      },
      { $project: { _id: 0, date: "$_id", total: 1 } },
       { $sort: { date: 1 } }
    );

    const sales = await Order.aggregate(pipeline);
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
    const pipeline = [];
    const matchStage = buildDateMatchStage(req.query.range);
    if (matchStage) {
      pipeline.push(matchStage);
    }

    pipeline.push(
      {
        $group: {
          _id: "$customer.email",
          name: { $first: "$customer.name" },
          orders: { $sum: 1 },
        },
      },
      { $project: { _id: 0, email: "$_id", name: 1, orders: 1 } },
       { $sort: { name: 1 } }
    );

    const customers = await Order.aggregate(pipeline);
    res.json(customers);
  } catch (err) {
    next(err);
  }
};

export default { getSalesReport, getInventoryReport, getCustomerReport };
