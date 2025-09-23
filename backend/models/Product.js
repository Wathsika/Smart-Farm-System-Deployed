import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Product name is required"], 
      trim: true 
    },
    
    sku: { 
      type: String, 
      trim: true,
      set: v => (v === '' ? null : v)
    },

    category: { 
      type: String, 
      trim: true,
      default: "General"
    },

    price: { 
      type: Number, 
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },

    unit: { 
      type: String, 
      trim: true 
    },

    description: { 
      type: String, 
      trim: true 
    },

    images: [{ 
      type: String 
    }], 
    
    tags: [{ 
      type: String 
    }],

    stock: {
      qty: { 
        type: Number, 
        default: 0,
        min: [0, "Stock quantity cannot be negative"]
      },
      lowStockThreshold: { 
        type: Number, 
        default: 10,
        min: [0, "Low stock threshold cannot be negative"]
      }
    },
    
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
      default: 'ACTIVE'
    }
  },
  { 
    timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
  }
);
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
const Product = mongoose.model("Product", productSchema);
export default Product;
