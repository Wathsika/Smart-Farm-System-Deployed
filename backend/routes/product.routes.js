import express from 'express';
import multer from 'multer';

// Import all the controller functions for product management.
import { 
    createProduct, 
    getAllProducts,
    getProductById,
    updateProduct, 
    deleteProduct 
} from '../controllers/product.controller.js';

// Create a new router instance from Express.
const router = express.Router();

// --- Multer Configuration ---
// This middleware is responsible for parsing `multipart/form-data`,
// which is used when a form includes a file upload.
// We use `memoryStorage` to temporarily hold the uploaded file in memory as a Buffer.
// This is ideal for immediately sending it to a cloud service like Cloudinary.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// --- DEFINE PRODUCT API ROUTES ---

// 1. GET ALL PRODUCTS (Read)
// METHOD:  GET
// PATH:    /api/products
// ACTION:  Fetches a paginated list of all products.
// NOTE:    No file upload, so no `upload` middleware is needed.
router.get('/', getAllProducts);


// 2. GET A SINGLE PRODUCT BY ID (Read)
// METHOD:  GET
// PATH:    /api/products/:id
// ACTION:  Fetches the details of a single product.
router.get('/:id', getProductById);


// 3. CREATE A NEW PRODUCT (Create)
// METHOD:  POST
// PATH:    /api/products
// ACTION:  Creates a new product. Uses `multer` to handle the optional image upload.
//          `upload.single('image')` tells multer to look for a file in the form field named 'image'.
//          This name MUST match the key used in the frontend FormData.
router.post('/', upload.single('image'), createProduct);


// 4. UPDATE AN EXISTING PRODUCT (Update)
// METHOD:  PUT
// PATH:    /api/products/:id
// ACTION:  Updates a product by its ID. Also uses `multer` to handle an optional new image.
router.put('/:id', upload.single('image'), updateProduct);


// 5. DELETE A PRODUCT (Delete)
// METHOD:  DELETE
// PATH:    /api/products/:id
// ACTION:  Deletes a product by its ID.
router.delete('/:id', deleteProduct);


// Export the configured router to be used in your main `index.js` file.
export default router;