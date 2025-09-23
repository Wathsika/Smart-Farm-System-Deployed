
import mongoose from 'mongoose';

const applicationPlanSchema = new mongoose.Schema({
  crop:   { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  field:  { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  product:{ type: mongoose.Schema.Types.ObjectId, ref: 'Input', required: true },
  schedule: {
    type: { type: String, enum: ['once','daily','weekly','monthly'], default: 'once' },
    startDate: { type: Date, required: true },
    repeatEvery: { type: Number, default: 1 },
    occurrences: { type: Number }
  },
  dosage: { amount: Number, unit: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('ApplicationPlan', applicationPlanSchema);
