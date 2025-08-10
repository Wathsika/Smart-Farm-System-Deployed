import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, unique: true, index: true },
    category: { type: String, default: "General" }, // e.g. Dairy | Vegetables | Fruits
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String }], // Cloudinary URLs later
    tags: [{ type: String }],   // ["Fresh","Organic"]
    stock: {
      qty: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 10 }
    },
    status: { type: String, enum: ["active", "archived"], default: "active" },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
