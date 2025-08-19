import express from 'express';

// Controllers
import {
  createCheckoutSession,
  stripeWebhookHandler,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  cancelOrder,
  getOrderBySessionId
} from '../controllers/order.controller.js';

// Auth
import { requireAuth as protect, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// --- Public & Customer-Facing ---

router.post('/create-checkout-session', express.json(), createCheckoutSession);

// This path remains for compatibility with your existing setup
router.post('/webhook', stripeWebhookHandler);

// ✅ Make the session lookup PUBLIC so success page works without login
router.get('/session/:sessionId', getOrderBySessionId);

// User’s own orders (requires auth)
router.get('/myorders', protect, getMyOrders);

// Cancel own order (requires auth)
router.put('/:id/cancel', protect, cancelOrder);

// --- Admin-only ---
router.get('/', protect, requireRole('Admin'), getAllOrders);
router.get('/:id', protect, requireRole('Admin'), getOrderById);
router.put('/:id/status', protect, requireRole('Admin'), express.json(), updateOrderStatus);

export default router;
