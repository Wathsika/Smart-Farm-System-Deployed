const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['fertilizer','pesticide'], required: true },

  // Fertilizer specific
  npk: { type: String }, // e.g., "10-26-26"

  // Pesticide specific
  activeIngredient: { type: String },      // e.g., "Imidacloprid 17.8% SL"
  targetPests: [{ type: String }],

  // Common
  dilutionRate: { type: String },          // e.g., "2 ml/L" or "50 kg/ha"
  dosagePerArea: {                         // recommend per area
    amount: Number,
    unit: String                           // e.g., "kg/acre", "ml/acre"
  },
  method: { type: String, enum: ['soil','foliar','drip','spray','seed'] },
  preHarvestIntervalDays: { type: Number, default: 0 }, // PHI
  reEntryHours: { type: Number, default: 0 },           // REI

  manufacturer: String,
  batchNo: String,
  expiryDate: Date,

  unit: { type: String, default: 'L' },   // L, ml, kg, g, bag, etc.
  stockQty: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },

  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
