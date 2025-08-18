const mongoose = require('mongoose');

const applicationPlanSchema = new mongoose.Schema({
  crop:   { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  field:  { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  product:{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  schedule: {
    type: { type: String, enum: ['once','daily','weekly','monthly'], default: 'once' },
    startDate: { type: Date, required: true },
    repeatEvery: { type: Number, default: 1 },  // every N days/weeks/months
    occurrences: { type: Number }               // optional cap
  },
  dosage: { amount: Number, unit: String },     // e.g., {0.5,'ml/L'}
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ApplicationPlan', applicationPlanSchema);
