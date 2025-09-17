import mongoose from "mongoose";

const orderCounterSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    sequence: { type: Number, default: 0 },
  },
  { timestamps: true }
);

orderCounterSchema.index({ year: 1, month: 1 }, { unique: true });

const OrderCounter =
  mongoose.models.OrderCounter ||
  mongoose.model("OrderCounter", orderCounterSchema);

const orderItemSchema = new mongoose.Schema({
  // Use 'product' as the key to match the ref, which is good practice.
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});

// Optional discount applied to the order
const discountSchema = new mongoose.Schema(
  {
    discountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discount' },
    code: { type: String },
    amount: { type: Number },
    type: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Customer info (for guest checkout)
      orderNumber: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },

    orderItems: [orderItemSchema],
    
    shippingAddress: {
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "Sri Lanka" },
      
    },

    discount: discountSchema,
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    
    // Order Status - for your internal fulfillment process
    paidAt: { type: Date },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    
     paymentMethod: { type: String, default: "Stripe" },
    stripeSessionId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

orderSchema.statics.generateOrderNumber = async function (date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const counter = await OrderCounter.findOneAndUpdate(
    { year, month },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const monthSegment = month.toString().padStart(2, "0");
  const sequenceSegment = counter.sequence.toString().padStart(3, "0");

  return `ORD-${year}-${monthSegment}-${sequenceSegment}`;
};

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order