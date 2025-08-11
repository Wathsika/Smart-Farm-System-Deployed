import stripe from '../config/stripe.config.js'; 
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// --- CREATE A STRIPE CHECKOUT SESSION ---
// Make sure 'export' is here
export const createCheckoutSession = async (req, res) => {
    try {
        const { cartItems, customerInfo } = req.body;

        if (!cartItems || cartItems.length === 0 || !customerInfo) {
            return res.status(400).json({ message: "Cart items and customer information are required." });
        }

        const line_items = await Promise.all(cartItems.map(async (item) => {
            const product = await Product.findById(item._id);
            if (!product) throw new Error(`Product not found: ${item.name}`);
            return {
                price_data: {
                    currency: 'lkr',
                    product_data: { name: product.name, images: product.images || [] },
                    unit_amount: Math.round(product.price * 100),
                },
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
                cartItems: JSON.stringify(cartItems.map(item => ({
                    productId: item._id, name: item.name, qty: item.quantity,
                    price: item.price, image: item.images?.[0]
                }))),
                customerName: customerInfo.name,
                addressLine1: customerInfo.addressLine1,
                city: customerInfo.city,
                postalCode: customerInfo.postalCode,
            },
        });
        
        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- FULFILL THE ORDER (CALLED BY WEBHOOK) ---
// This is an internal helper function, so it does NOT need 'export'
const fulfillOrder = async (session) => {
    const existingOrder = await Order.findOne({ stripeSessionId: session.id });
    if (existingOrder) {
        console.log(`Order for session ${session.id} already fulfilled.`);
        return;
    }

    try {
        const cartItems = JSON.parse(session.metadata.cartItems);
        const newOrder = new Order({
            customer: { name: session.metadata.customerName, email: session.customer_email },
            shippingAddress: {
                addressLine1: session.metadata.addressLine1,
                city: session.metadata.city,
                postalCode: session.metadata.postalCode
            },
            orderItems: cartItems.map(item => ({...item, product: item.productId})),
            totalPrice: session.amount_total / 100,
            isPaid: true,
            paidAt: new Date(),
            status: 'PROCESSING',
            stripeSessionId: session.id,
        });
        const savedOrder = await newOrder.save();

        for (const item of savedOrder.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { 'stock.qty': -item.qty }
            });
        }
        console.log(`✅ Order fulfilled and saved for session: ${session.id}`);
    } catch (error) {
        console.error(`❌ Error fulfilling order for session ${session.id}:`, error);
    }
};

// --- STRIPE WEBHOOK HANDLER ---
// Make sure 'export' is here
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

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if(session.payment_status === 'paid'){
             await fulfillOrder(session);
        }
    }
    res.status(200).json({ received: true });
};