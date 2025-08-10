// controllers/product.controller.js
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

// POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      price,
      description,
      category,
      tags = [],
      images = [],
      isOrganic = false,
      stock = 0,
      lowStockThreshold = 10,
      status = "ACTIVE",
    } = req.body;

    const product = await Product.create({
      name,
      sku,
      price,
      description,
      category,
      tags,
      images,
      isOrganic,
      status,
    });

    // create inventory row paired to product
    await Inventory.create({
      product: product._id,
      stock,
      lowStockThreshold,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// GET /api/products
// Filters: q, category, tag, min, max | sort | pagination
export const listProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      tag,
      min = 0,
      max = 1e9,
      page = 1,
      limit = 12,
      sort = "-createdAt",
      status = "ACTIVE",
    } = req.query;

    const filter = {
      status,
      price: { $gte: Number(min), $lte: Number(max) },
      ...(category ? { category } : {}),
      ...(tag ? { tags: tag } : {}),
      ...(q ? { name: { $regex: q, $options: "i" } } : {}),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
export const getProduct = async (req, res, next) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Product not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const prod = await Product.findByIdAndDelete(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    await Inventory.findOneAndDelete({ product: prod._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
