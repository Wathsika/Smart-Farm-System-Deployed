import express from 'express';

// Import the correct controller functions for the Stripe flow
import {
  createCheckoutSession,
  stripeWebhookHandler
} from '../controllers/order.controller.js';

const router = express.Router();


// --- THIS IS THE FIX ---
// Apply the express.json() middleware.
// This tells Express to parse the body of incoming JSON requests for any route defined below this line.
// This is essential for the '/create-checkout-session' route to read the cart and customer data.
router.use(express.json());


// --- ROUTE 1: Create Stripe Checkout Session ---
// This route now correctly receives a populated `req.body`.
// ROUTE: POST /api/orders/create-checkout-session
router.post('/create-checkout-session', createCheckoutSession);


// --- ROUTE 2: Stripe Webhook Handler ---
// This special route for the webhook still needs its own `express.raw()` parser.
// Because it's defined on the route itself, it overrides the `express.json()` middleware
// we defined above ONLY for this specific POST /webhook request.
// ROUTE: POST /api/orders/webhook
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // This special middleware runs for this route
  stripeWebhookHandler
);


export default router;