import mongoose from "mongoose";
const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    reserved: { type: Number, default: 0, min: 0 }, // for future orders
  },
  { timestamps: true }
);
export default mongoose.model("Inventory", inventorySchema);
