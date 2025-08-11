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
      // This setter is crucial: it converts any empty string ('') sent from the frontend
      // into 'null'. This allows the sparse unique index to work correctly,
      // preventing "duplicate key" errors for products without an SKU.
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
      trim: true // e.g., "kg", "dozen", "bundle", "L"
    },

    description: { 
      type: String, 
      trim: true 
    },

    images: [{ 
      type: String // An array to hold Cloudinary image URLs
    }], 
    
    tags: [{ 
      type: String 
    }],

    // --- Embedded Stock Management ---
    // All inventory details are stored directly within the product document.
    // This simplifies queries and management.
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

// --- Indexing ---
// This creates a unique index on the 'sku' field.
// `sparse: true` is essential. It tells MongoDB to enforce uniqueness only
// for documents that have a value for 'sku' and to allow multiple
// documents to have a null/missing 'sku'.
productSchema.index({ sku: 1 }, { unique: true, sparse: true });


const Product = mongoose.model("Product", productSchema);

export default Product;