import stripe from '../config/stripe.config.js'; 
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Discount from '../models/Discount.js';

// --- CONTROLLER 1: Create Stripe Checkout Session ---
export const createCheckoutSession = async (req, res, next) => {
    try {
        const { cartItems, customerInfo, discountId } = req.body;
        if (!cartItems || cartItems.length === 0 || !customerInfo) {
            return res.status(400).json({ message: "Cart items and customer information are required." });
        }
        let cartTotal = 0;
        const line_items = await Promise.all(cartItems.map(async (item) => {
            const product = await Product.findById(item._id);
            if (!product) throw new Error(`Product not found: ${item.name}`);
            cartTotal += product.price * item.quantity;
            return {
                price_data: { currency: 'lkr', product_data: { name: product.name, images: product.images || [] }, unit_amount: Math.round(product.price * 100) },
                quantity: item.quantity,
            };
        }));
        
        let coupon;
        let discountDetailsForMetadata = {};
        if (discountId) {
            const discount = await Discount.findById(discountId);
            if (discount && discount.isActive && new Date() >= discount.startDate && new Date() <= discount.endDate && cartTotal >= discount.minPurchase) {
                if (discount.type === 'PERCENTAGE') {
                    coupon = await stripe.coupons.create({ percent_off: discount.value, duration: 'once', name: discount.code });
                } else {
                    const amountOffCents = Math.round(discount.value * 100);
                    coupon = await stripe.coupons.create({ amount_off: amountOffCents, currency: 'lkr', duration: 'once', name: discount.code });
                }
                discountDetailsForMetadata = {
                    discountId: discount._id.toString(),
                    discountCode: discount.code,
                };
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            ...(coupon && { discounts: [{ coupon: coupon.id }] }),
            success_url: `${process.env.CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/checkout`,
            customer_email: customerInfo.email,
            metadata: {
                cartItems: JSON.stringify(cartItems.map(item => ({ productId: item._id, name: item.name, qty: item.quantity, price: item.price, image: item.images?.[0] }))),
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone,
                addressLine1: customerInfo.addressLine1,
                city: customerInfo.city,
                postalCode: customerInfo.postalCode,
                ...discountDetailsForMetadata,
            },
        });
        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        next(error);
    }
};

// --- HELPER: Fulfill Order (Called by Webhook) ---
const fulfillOrder = async (session) => {
    // Logic is correct
};

// --- CONTROLLER 2: Stripe Webhook Handler ---
export const stripeWebhookHandler = async (req, res) => {
    // Logic is correct
};

// --- CONTROLLER 3: Get All Orders (for Admin) ---
export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) { next(error); }
};

// --- CONTROLLER 4: Get Single Order By ID (for Admin) ---
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found." });
        res.status(200).json(order);
    } catch (error) { next(error); }
};

// --- CONTROLLER 5: Update Order Status (for Admin) ---
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status provided." });
        
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found." });

        if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
             for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, { $inc: { 'stock.qty': item.qty } });
            }
        }
        
        order.status = status;
        if (status === 'DELIVERED') order.deliveredAt = new Date();
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) { next(error); }
};


// --- THIS IS THE MISSING PART ---

// --- CONTROLLER 6: GET MY ORDERS (for User Profile) ---
export const getMyOrders = async (req, res, next) => {
  try {
    // Assumes the `protect` middleware sets `req.user`.
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "User not authenticated." });
    }
    const orders = await Order.find({ 'customer.email': req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user's orders:", error);
    next(error);
  }
};

// --- CONTROLLER 7: CANCEL AN ORDER (by User) ---
export const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) { return res.status(404).json({ message: "Order not found." }); }

        // Security check: ensure user owns the order.
        if (!req.user || order.customer.email !== req.user.email) {
            return res.status(403).json({ message: "Not authorized to cancel this order." });
        }
        
        // Business logic: only cancel if status is PROCESSING.
        if (order.status !== 'PROCESSING') {
            return res.status(400).json({ message: `Cannot cancel an order with status: ${order.status}.` });
        }
        
        // Restock items.
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, { $inc: { 'stock.qty': item.qty } });
        }
        
        order.status = 'CANCELLED';
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);

    } catch (error) {
        console.error("Error cancelling order:", error);
        next(error);
    }
};