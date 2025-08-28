import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Discount name is required."],
      trim: true,
      description: "A user-friendly name for the discount (e.g., 'Summer Sale')."
    },
    
    code: {
      type: String,
      required: [true, "Discount code is required."],
      unique: true, // Each code must be unique
      trim: true,
      uppercase: true, // Automatically converts codes like 'summer10' to 'SUMMER10'
      description: "The actual code customers will enter (e.g., 'SUMMER20')."
    },
    
    type: {
      type: String,
      required: true,
      enum: ['PERCENTAGE', 'FLAT'],
      default: 'PERCENTAGE',
       description: "The type of discount: a percentage or a flat monetary amount."
    },
    
    value: {
      type: Number,
      required: [true, "Discount value is required."],
      min: [0, "Discount value cannot be negative."],
      description: "The numeric value of the discount (e.g., 20 for 20%, or 500 for Rs 500)."
    },

    minPurchase: {
      type: Number,
      default: 0,
      min: [0, "Minimum purchase amount cannot be negative."],
      description: "The minimum cart total required to apply this discount."
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required."],
      default: Date.now,
      description: "The date when the discount becomes active."
    },
    
    endDate: {
      type: Date,
      required: [true, "End date is required."],
      description: "The date when the discount expires."
    },

    isActive: {
      type: Boolean,
      default: true,
      description: "A flag to manually enable or disable the discount."
    },
    
    usageLimit: {
      type: Number,
      default: null, // null means unlimited uses
      min: [0, "Usage limit cannot be negative."],
      description: "How many times this coupon can be used in total (null for unlimited)."
    },
    
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
      description: "How many times this coupon has been used."
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);


const Discount = mongoose.model("Discount", discountSchema);
export default Discount;