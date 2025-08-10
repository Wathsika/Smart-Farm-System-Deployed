import express from 'express';
import multer from 'multer';
import { 
    createProduct, 
    updateProduct, 
    getAllProducts,
    deleteProduct 
} from '../controllers/product.controller.js'; // Assuming this is your controller file

const router = express.Router();

// --- Configure Multer ---
// This tells Multer how to handle incoming files.
// memoryStorage() holds the file in a buffer in memory. It's great for processing
// with a cloud service like Cloudinary, as you don't need to save to disk first.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Define Routes ---

// GET /api/products - Get all products (no file upload, no multer)
router.get('/', getAllProducts);

// POST /api/products - Create a product
// Apply multer middleware here. It expects a single file from a field named 'image'.
// This 'image' name MUST match the name you use in your frontend FormData.
router.post('/', upload.single('image'), createProduct);

// PUT /api/products/:id - Update a product
// Also apply multer here for updating images.
router.put('/:id', upload.single('image'), updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', deleteProduct);


export default router;