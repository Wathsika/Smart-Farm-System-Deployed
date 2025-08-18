import express from 'express';

// --- Import Controller Functions ---
// All the functions needed to handle the logic for these routes.
import {
  createCheckoutSession,
  stripeWebhookHandler,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  cancelOrder
} from '../controllers/order.controller.js';

// --- Import Middleware ---
// Import both `requireAuth` and `requireRole` for security.
// We rename `requireAuth` to `protect` for cleaner route definitions.
import { requireAuth as protect, requireRole } from '../middlewares/auth.js';


// Create a new router instance.
const router = express.Router();


// --- GROUP 1: Public & Customer-Facing Routes ---

// Creates a Stripe payment session. Needs a JSON body.
router.post('/create-checkout-session', express.json(), createCheckoutSession);

// Securely handles incoming events from Stripe. Needs the raw request body.
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Fetches the orders for the currently logged-in user. `protect` middleware runs first.
router.get('/myorders', protect, getMyOrders);

// Allows the currently logged-in user to cancel their own order.
router.put('/:id/cancel', protect, cancelOrder);


// --- GROUP 2: Admin-Only Routes ---
// These routes require the user to be logged in (`protect`) AND have the role 'Admin'.

// Fetches a list of ALL orders in the system.
router.get('/', protect, requireRole('Admin'), getAllOrders);

// Fetches a single order by its ID.
router.get('/:id', protect, requireRole('Admin'), getOrderById);

// Updates the fulfillment status of an order (e.g., to 'SHIPPED').
router.put('/:id/status', protect, requireRole('Admin'), express.json(), updateOrderStatus);


export default router;