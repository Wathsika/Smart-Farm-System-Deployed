import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  // Use 'product' as the key to match the ref, which is good practice.
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    // Customer info (for guest checkout)
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },

    orderItems: [orderItemSchema],
    
    shippingAddress: {
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "Sri Lanka" }
    },

    totalPrice: { 
      type: Number, 
      required: true 
    },
    
    // Payment Status - from Stripe
    isPaid: { 
      type: Boolean, 
      default: false 
    },
    paidAt: { 
      type: Date 
    },
    
    // Order Status - for your internal fulfillment process
    status: { 
      type: String, 
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING'
    },
    
    // Stripe-specific fields for tracking
    paymentMethod: { type: String, default: 'Stripe' },
    stripeSessionId: { type: String, unique: true, sparse: true }

  }, {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;