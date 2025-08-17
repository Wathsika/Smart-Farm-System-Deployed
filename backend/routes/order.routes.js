import express from 'express';
import {
  createCheckoutSession,
  stripeWebhookHandler,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  cancelOrder
} from '../controllers/order.controller.js';

// --- THIS IS THE FIX ---
// Import the function named 'requireAuth' but rename it to 'protect' for use in this file.
import { requireAuth as protect } from '../middlewares/auth.js';


const router = express.Router();

// --- Customer Facing Routes ---
router.post('/create-checkout-session', express.json(), createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);


// --- User Profile Routes (now correctly protected) ---
router.get('/myorders', protect, getMyOrders); 
router.put('/:id/cancel', protect, cancelOrder); 


// --- Admin Facing Routes ---
// You will later add `admin` middleware here too, e.g., router.get('/', protect, admin, getAllOrders)
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', express.json(), updateOrderStatus);


export default router;