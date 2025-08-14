import express from 'express';
import {
  createCheckoutSession,
  stripeWebhookHandler,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/order.controller.js';
// import { protect, admin } from '../middlewares/auth.js'; // You will uncomment these later

const router = express.Router();

// --- Customer Facing Routes ---
router.post('/create-checkout-session', express.json(), createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);


// --- Admin Facing Routes ---
// For now, these are public. Later, you'll add `protect` and `admin` middleware.
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', express.json(), updateOrderStatus);


export default router;