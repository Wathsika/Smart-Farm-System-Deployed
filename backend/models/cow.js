const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});
const Counter =
  mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/* --- Cow schema --- */
const cowSchema = new mongoose.Schema(
  {
    cowId: { type: String, unique: true, index: true }, // our custom ID
    name: { type: String, required: [true, "Please add the cow's name"] },
    breed: { type: String, required: [true, "Please add the cow's breed"] },
    gender:{ type: String, enum: ['Female','Male'], required: [true, 'Please select gender'] },
    bday:  { type: Date, required: [true, "Please add the cow's birth date"],
        validate: {
          validator: (v) => v instanceof Date && !isNaN(v) && v <= new Date(), // not future & valid
          message: 'Invalid birth date'
        }
    },
  },
  { timestamps: true }
);

// Auto-generate COW-0001, COW-0002, ...
cowSchema.pre('save', async function (next) {
  if (this.cowId) return next();
  try {
    const c = await Counter.findOneAndUpdate(
      { key: 'cow' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.cowId = `COW-${String(c.seq).padStart(4, '0')}`;
    next();
  } catch (e) { next(e); }
});

module.exports = mongoose.model('Cow', cowSchema);
