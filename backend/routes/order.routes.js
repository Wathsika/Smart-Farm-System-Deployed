import express from 'express';
import {
  createCheckoutSession,
  stripeWebhookHandler,
  getAllOrders,
  getOrderById,
  getOrderBySessionId,
  updateOrderStatus,
  getMyOrders,
  cancelOrder
} from '../controllers/order.controller.js';

// --- THIS IS THE FIX ---
// Import the function named 'requireAuth' but rename it to 'protect' for use in this file.
import { requireAuth as protect, requireRole } from '../middlewares/auth.js';
import orderEvents from '../events/orderEvents.js';


const router = express.Router();

// --- Customer Facing Routes ---
router.post('/create-checkout-session', express.json(), createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);
router.get('/session/:sessionId', getOrderBySessionId);

// --- User Profile Routes (now correctly protected) ---
router.get('/myorders', protect, getMyOrders);
router.put('/:id/cancel', protect, cancelOrder);

// --- Real-time Order Status Events ---
router.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  const sendEvent = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  orderEvents.on('statusChange', sendEvent);

  req.on('close', () => {
    orderEvents.off('statusChange', sendEvent);
  });
});

// --- Admin Facing Routes ---
// You will later add `admin` middleware here too, e.g., router.get('/', protect, admin, getAllOrders)
router.get('/', protect, requireRole('ADMIN'), getAllOrders);
router.get('/:id', protect, requireRole('ADMIN'), getOrderById);
router.put('/:id/status', protect, requireRole('ADMIN'), express.json(), updateOrderStatus);


export default router;