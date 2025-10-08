import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['fertilizer','pesticide'], required: true },
  npk: { type: String }, 
  activeIngredient: { type: String },      
  targetPests: [{ type: String }],
  dilutionRate: { type: String },          
  dosagePerArea: {                         
    amount: Number,
    unit: String                          
  },
  method: { type: String, enum: ['soil','foliar','drip','spray','seed'] },
  preHarvestIntervalDays: { type: Number, default: 0 }, 
  reEntryHours: { type: Number, default: 0 },           
  manufacturer: String,
  batchNo: String,
  expiryDate: Date,
  unit: { type: String, default: 'L' },   
  stockQty: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },

  notes: String
}, { timestamps: true });

export default mongoose.model('Input', schema);
