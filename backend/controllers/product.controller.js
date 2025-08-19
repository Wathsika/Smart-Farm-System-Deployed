// Import your Mongoose Product model
import Product from '../models/Product.js';

// Import the real Cloudinary uploader from your config file
import { uploadToCloudinary } from '../config/cloudinary.config.js';

// --- CONTROLLER FUNCTION 1: GET ALL PRODUCTS (Read) ---
// Fetches a paginated list of all products.
export const getAllProducts = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.limit) || 10;
        const count = await Product.countDocuments();

        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({
            items: products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        next(error); // Pass error to your centralized error handler
    }
};


// --- CONTROLLER FUNCTION 2: CREATE A NEW PRODUCT (Create) ---
// Creates a new product, handling an optional image upload.
export const createProduct = async (req, res, next) => {
    try {
        const { name, category, price, unit, description, stock, sku } = req.body;
        
        // Basic validation
        if (!name || price === undefined || !stock || stock.qty === undefined) {
            return res.status(400).json({ message: "Name, price, and stock quantity are required." });
        }

        let imageUrl = null;
        // Check if a file was uploaded by multer
        if (req.file) {
            // Upload the file's buffer to Cloudinary into a specific folder
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
        next(error);
    }
};


// --- CONTROLLER FUNCTION 3: UPDATE AN EXISTING PRODUCT (Update) ---
// Updates a product by its ID, handling an optional new image upload.
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        const { name, category, price, unit, description, stock, sku } = req.body;
        
        // Ensure product.stock is an object to prevent errors with old data
        if (!product.stock) {
            product.stock = {};
        }

        // Update fields only if they are provided in the request body
        product.name = name ?? product.name;
        product.sku = sku !== undefined ? sku : product.sku;
        product.category = category ?? product.category;
        product.price = price !== undefined ? Number(price) : product.price;
        product.unit = unit ?? product.unit;
        product.description = description ?? product.description;

        if (stock) {
            if (stock.qty !== undefined) product.stock.qty = Number(stock.qty);
            if (stock.lowStockThreshold !== undefined) product.stock.lowStockThreshold = Number(stock.lowStockThreshold);
        }

        // Handle new image upload (replaces the old image)
        if (req.file) {
            const newImageUrl = await uploadToCloudinary(req.file.buffer, 'smart_farm_products');
            product.images = [newImageUrl];
        }

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error("Error updating product:", error);
        next(error);
    }
};


// --- CONTROLLER FUNCTION 4: DELETE A PRODUCT (Delete) ---
// Deletes a product by its ID.
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        
        // We can optionally delete the image from Cloudinary here to save space
        // (This would require a new helper function in cloudinary.config.js)

        res.status(200).json({ message: "Product removed successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        next(error);
    }
};

// --- CONTROLLER FUNCTION 5: GET A SINGLE PRODUCT BY ID ---
// Fetches details for a single product.
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching single product:", error);
        next(error);
    }
}