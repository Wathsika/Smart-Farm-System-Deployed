import Order from '../models/Order.js';
import Product from '../models/Product.js';
import farmInfo from '../config/farm.config.js';
import farmInfo from "../config/farmInfo.js";

// Helper to build date filter based on range
function buildDateMatch(range = 'all') {
  const now = new Date();
  let start;
  switch (range) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      break;
    default:
      return {};
  }
  return { createdAt: { $gte: start, $lte: now } };
}

export const getSalesReport = async (req, res, next) => {
  try {
    const range = req.query.range || 'all';
    const match = buildDateMatch(range);
    const stats = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
    ]);
    const { totalOrders = 0, revenue = 0 } = stats[0] || {};
    const avgOrderValue = totalOrders ? revenue / totalOrders : 0;
    res.json({
      header: farmInfo,
      range,
      totalOrders,
      revenue,
      averageOrderValue: avgOrderValue,
    });
  } catch (err) {
    next(err);
  }
};

export const getInventoryReport = async (req, res, next) => {
  try {
    const range = req.query.range || 'all';
    const match = buildDateMatch(range);
    const sales = await Order.aggregate([
      { $match: match },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          soldUnits: { $sum: '$orderItems.qty' },
        },
      },
    ]);
    const soldMap = new Map(sales.map((s) => [String(s._id), s.soldUnits]));
    const products = await Product.find({}, 'name stock.qty');
    const items = products.map((p) => {
      const currentStock = p.stock?.qty ?? 0;
      const soldUnits = soldMap.get(String(p._id)) || 0;
      const initialStock = currentStock + soldUnits;
      return {
        productId: p._id,
        name: p.name,
        initialStock,
        currentStock,
        soldUnits,
      };
    });
    res.json({ header: farmInfo, range, items });
  } catch (err) {
    next(err);
  }
};

export const getCustomerReport = async (req, res, next) => {
  try {
    const range = req.query.range || 'all';
    const match = buildDateMatch(range);
    const customers = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$customer.email',
          name: { $first: '$customer.name' },
          email: { $first: '$customer.email' },
          orderCount: { $sum: 1 },
          totalSpend: { $sum: '$totalPrice' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          email: 1,
          orderCount: 1,
          totalSpend: 1,
          lastOrderDate: 1,
        },
      },
      { $sort: { totalSpend: -1 } },
    ]);
    res.json({ header: farmInfo, range, customers });
  } catch (err) {
    next(err);
  }
};

export const getFarmInfo = (req, res) => {
  res.status(200).json(farmInfo);
};

export default { getSalesReport, getInventoryReport, getCustomerReport };