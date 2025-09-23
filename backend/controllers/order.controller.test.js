import test from 'node:test';
import assert from 'node:assert/strict';

// Ensure required env vars before importing Stripe config
process.env.STRIPE_SECRET_KEY = 'test_key';
process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.CLIENT_URL = 'http://client';

function createRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; }
  };
}

// ---- Test createCheckoutSession ----
test('createCheckoutSession returns Stripe session info', async (t) => {
  const stripe = (await import('../config/stripe.config.js')).default;
  const Product = (await import('../models/Product.js')).default;
  const Discount = (await import('../models/Discount.js')).default;
  const { createCheckoutSession } = await import('./order.controller.js');

  const origCreate = stripe.checkout.sessions.create;
  const origFindById = Product.findById;
  const origDiscountFind = Discount.findById;
  t.after(() => {
    stripe.checkout.sessions.create = origCreate;
    Product.findById = origFindById;
    Discount.findById = origDiscountFind;
  });

  stripe.checkout.sessions.create = async () => ({ id: 'sess_1', url: 'https://example' });
  Product.findById = async () => ({ _id: 'p1', name: 'Prod', price: 5, images: ['img'] });
  Discount.findById = async () => null;

  const req = {
    body: {
      cartItems: [{ _id: 'p1', name: 'Prod', quantity: 1, price: 5 }],
      customerInfo: {
        name: 'Alice', email: 'a@test.com', phone: '123',
        addressLine1: 'Street', city: 'Town', postalCode: '12345'
      }
    }
  };
  const res = createRes();
  await createCheckoutSession(req, res, () => { throw new Error('next called'); });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.id, 'sess_1');
  assert.equal(res.body.url, 'https://example');
});

// ---- Test stripeWebhookHandler ----
test('stripeWebhookHandler fulfills and saves order', async (t) => {
  const stripe = (await import('../config/stripe.config.js')).default;
  const Order = (await import('../models/Order.js')).default;
  const Product = (await import('../models/Product.js')).default;
  const Discount = (await import('../models/Discount.js')).default;
  const { stripeWebhookHandler } = await import('./order.controller.js');

  const savedOrders = [];
  const origConstruct = stripe.webhooks.constructEvent;
  const origSave = Order.prototype.save;
  const origFindUpdate = Product.findByIdAndUpdate;
  const origDiscFind = Discount.findById;
   const origGenerate = Order.generateOrderNumber;
  t.after(() => {
    stripe.webhooks.constructEvent = origConstruct;
    Order.prototype.save = origSave;
    Product.findByIdAndUpdate = origFindUpdate;
    Discount.findById = origDiscFind;
    Order.generateOrderNumber = origGenerate;
  });

  stripe.webhooks.constructEvent = () => ({
    type: 'checkout.session.completed',
    data: {
      object: {
        metadata: {
          cartItems: JSON.stringify([{ productId: 'p1', name: 'Prod', qty: 2, price: 5, image: 'img' }]),
          customerName: 'Alice',
          customerPhone: '123',
          addressLine1: 'Street',
          city: 'Town',
          postalCode: '12345'
        },
        total_details: { amount_discount: 0 },
        customer_details: { email: 'a@test.com' }
      }
    }
  });

  Order.prototype.save = async function () { savedOrders.push(this.toObject()); return this; };
  Product.findByIdAndUpdate = async () => {};
  Discount.findById = async () => null;
Order.generateOrderNumber = async () => 'ORD-2024-01-001';

  const req = { headers: { 'stripe-signature': 'sig' }, body: '{}' };
  const res = createRes();
  await stripeWebhookHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(savedOrders.length, 1);
  assert.equal(savedOrders[0].customer.email, 'a@test.com');
  assert.equal(savedOrders[0].orderItems.length, 1);
  assert.equal(savedOrders[0].orderNumber, 'ORD-2024-01-001');
});

// ---- Test cancelOrder ----
test('cancelOrder cancels pending order and restocks items', async (t) => {
  const Order = (await import('../models/Order.js')).default;
  const Product = (await import('../models/Product.js')).default;
  const { cancelOrder } = await import('./order.controller.js');

  const restockCalls = [];
  const origFindById = Order.findById;
  const origProdUpdate = Product.findByIdAndUpdate;
  t.after(() => {
    Order.findById = origFindById;
    Product.findByIdAndUpdate = origProdUpdate;
  });

  const order = {
    _id: 'o1',
    status: 'PENDING',
    customer: { email: 'user@example.com' },
    orderItems: [{ product: 'p1', qty: 3 }],
    save: async function () { return this; }
  };
  Order.findById = async (id) => (id === 'o1' ? order : null);
  Product.findByIdAndUpdate = async (id, update) => { restockCalls.push({ id, update }); };

  const req = { params: { id: 'o1' }, user: { email: 'user@example.com' } };
  const res = createRes();
  await cancelOrder(req, res, () => { throw new Error('next called'); });
  assert.equal(res.statusCode, 200);
  assert.equal(order.status, 'CANCELLED');
  assert.equal(restockCalls.length, 1);
  assert.deepEqual(restockCalls[0], { id: 'p1', update: { $inc: { 'stock.qty': 3 } } });
});