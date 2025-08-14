import stripe from '../config/stripe.config.js'; 
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// --- 1. CREATE STRIPE CHECKOUT SESSION (for Customers) ---
export const createCheckoutSession = async (req, res, next) => {
    try {
        const { cartItems, customerInfo } = req.body;
        if (!cartItems || cartItems.length === 0 || !customerInfo) {
            return res.status(400).json({ message: "Cart items and customer information are required." });
        }
        const line_items = await Promise.all(cartItems.map(async (item) => {
            const product = await Product.findById(item._id);
            if (!product) throw new Error(`Product not found: ${item.name}`);
            return {
                price_data: { currency: 'lkr', product_data: { name: product.name, images: product.images || [] }, unit_amount: Math.round(product.price * 100) },
                quantity: item.quantity,
            };
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
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
            },
        });
        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        next(error);
    }
};

// --- 2. FULFILL ORDER (Internal Helper for Webhook) ---
const fulfillOrder = async (session) => {
    const existingOrder = await Order.findOne({ stripeSessionId: session.id });
    if (existingOrder) {
        console.log(`Webhook ignored: Order for session ${session.id} already fulfilled.`);
        return;
    }
    try {
        const cartItems = JSON.parse(session.metadata.cartItems);
        const newOrder = new Order({
            customer: { name: session.metadata.customerName, email: session.customer_email, phone: session.metadata.customerPhone },
            shippingAddress: { addressLine1: session.metadata.addressLine1, city: session.metadata.city, postalCode: session.metadata.postalCode },
            orderItems: cartItems.map(item => ({...item, product: item.productId})),
            totalPrice: session.amount_total / 100,
            isPaid: true, paidAt: new Date(), status: 'PROCESSING', stripeSessionId: session.id,
        });
        const savedOrder = await newOrder.save();
        for (const item of savedOrder.orderItems) {
            await Product.findByIdAndUpdate(item.product, { $inc: { 'stock.qty': -item.qty } });
        }
        console.log(`✅ Order fulfilled and saved for session: ${session.id}`);
    } catch (error) {
        console.error(`❌ Error fulfilling order for session ${session.id}:`, error);
    }
};

// --- 3. STRIPE WEBHOOK HANDLER ---
export const stripeWebhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed' && event.data.object.payment_status === 'paid') {
        await fulfillOrder(event.data.object);
    }
    res.status(200).json({ received: true });
};

// --- 4. GET ALL ORDERS (for Admin) ---
export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        next(error);
    }
};

// --- 5. GET SINGLE ORDER BY ID (for Admin) ---
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        next(error);
    }
}

// --- 6. UPDATE ORDER STATUS (for Admin) ---
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status provided." });
        }
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // --- Restock logic for cancellation ---
        if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
             for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, { $inc: { 'stock.qty': item.qty } });
            }
        }
        
        order.status = status;
        if (status === 'DELIVERED') order.deliveredAt = new Date();

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error("Error updating order status:", error);
        next(error);
    }
};