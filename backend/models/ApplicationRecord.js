import mongoose from 'mongoose';

const quantitySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  unit: { type: String, required: true }
}, { _id: false });

const applicationRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Input', required: true },
  crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'ApplicationPlan' },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  method: { type: String },
  quantityUsed: quantitySchema,
  weather: { type: String },
  notes: { type: String }
}, { timestamps: true });

const ApplicationRecord = mongoose.model('ApplicationRecord', applicationRecordSchema);

export default ApplicationRecord;