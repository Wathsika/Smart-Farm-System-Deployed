import Product from '../models/Product.js';
import { uploadToCloudinary } from '../config/cloudinary.config.js'; // Import the REAL uploader

// --- GET ALL PRODUCTS (with Pagination) ---
export const getAllProducts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = 10;
        const count = await Product.countDocuments();
        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({ items: products, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server error while fetching products." });
    }
};

// --- CREATE A NEW PRODUCT ---
export const createProduct = async (req, res) => {
    try {
        const { name, category, price, unit, description, stock, sku } = req.body;
        
        if (!name || !price || !stock || stock.qty === undefined) {
            return res.status(400).json({ message: "Name, price, and stock quantity are required fields." });
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer, 'smart_farm_products');
        }

        const productData = {
            name, sku, category, unit, description,
            price: Number(price),
            stock: {
                qty: Number(stock.qty),
                lowStockThreshold: Number(stock.lowStockThreshold) || 10
            },
            images: imageUrl ? [imageUrl] : [],
        };

        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (error) {
        console.error("Error creating product:", error);
        if (error.code === 11000) return res.status(409).json({ message: "A product with this SKU already exists." });
        res.status(500).json({ message: "Server error while creating product.", error: error.message });
    }
};

// --- UPDATE AN EXISTING PRODUCT ---
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const { name, category, price, unit, description, stock, sku } = req.body;
        
        if (!product.stock) product.stock = {}; // Safety check for old data

        if (stock) {
            if (stock.qty !== undefined) product.stock.qty = Number(stock.qty);
            if (stock.lowStockThreshold !== undefined) product.stock.lowStockThreshold = Number(stock.lowStockThreshold);
        }
        
        product.name = name || product.name;
        product.sku = sku !== undefined ? sku : product.sku;
        product.category = category || product.category;
        product.price = price !== undefined ? Number(price) : product.price;
        product.unit = unit || product.unit;
        product.description = description || product.description;

        if (req.file) {
            const newImageUrl = await uploadToCloudinary(req.file.buffer, 'smart_farm_products');
            product.images = [newImageUrl];
        }

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error while updating product.", error: error.message });
    }
};

// --- DELETE A PRODUCT ---
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product removed successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error while deleting product.", error: error.message });
    }
};