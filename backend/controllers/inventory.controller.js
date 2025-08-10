// controllers/inventory.controller.js
import Inventory from "../models/Inventory.js";

// PATCH /api/inventory/:productId/adjust
// body: { delta: number }  (can be negative)
export const adjustStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { delta = 0 } = req.body;

    const inv = await Inventory.findOneAndUpdate(
      { product: productId },
      { $inc: { stock: Number(delta) } },
      { new: true }
    ).populate("product");

    if (!inv) return res.status(404).json({ message: "Inventory not found" });
    res.json(inv);
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/low-stock
export const lowStock = async (_req, res, next) => {
  try {
    const items = await Inventory.find({
      $expr: { $lt: ["$stock", "$lowStockThreshold"] },
    }).populate("product");

    res.json(items);
  } catch (err) {
    next(err);
  }
};
