import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { 
      type: String, 
      trim: true,
      set: v => (v === '' ? null : v) // Treat empty string as null for sparse index
    },
    category: { type: String, default: "General" },
    price: { type: Number, required: true },
    unit: { type: String }, // For 'kg', 'dozen', etc.
    description: { type: String },
    images: [{ type: String }],
    tags: [{ type: String }],
    stock: { // EMBEDDED DOCUMENT for stock
      qty: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 10 }
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'],
      default: 'ACTIVE'
    }
  },
  { timestamps: true }
);

// The correct sparse index for optional unique SKU
productSchema.index({ sku: 1 }, { unique: true, sparse: true });

const Product = mongoose.model("Product", productSchema);
export default Product;