import mongoose from 'mongoose';

const cowSchema = new mongoose.Schema(
  {
    cowId: { type: String, unique: true, index: true }, // custom ID
    name: { type: String, required: [true, "Please add the cow's name"] },
    breed: { type: String, required: [true, "Please add the cow's breed"] },
    gender: {
      type: String,
      enum: ['Female','Male'],
      required: [true, 'Please select gender']
    },
    bday: {
      type: Date,
      required: [true, "Please add the cow's birth date"],
      validate: {
        validator: (v) => {
          if (!(v instanceof Date) || isNaN(v)) return false;
          const today = new Date();
          today.setHours(0,0,0,0);
          const d = new Date(v);
          d.setHours(0,0,0,0);
          return d <= today;
        },
        message: 'Birth date cannot be in the future',
      }
    },
    photoUrl: { type: String, default: "" } 
  },
  { timestamps: true }
);

// Auto-generate COW-0001, COW-0002, ...
cowSchema.pre('save', async function (next) {
  if (this.cowId) return next();
  try {
    // find highest cowId
    const lastCow = await mongoose.model('Cow').findOne({ cowId: { $exists: true } })
      .sort({ cowId: -1 }) // sort descending by cowId
      .select('cowId')
      .lean();

    let nextNumber = 1;
    if (lastCow?.cowId) {
      const num = parseInt(lastCow.cowId.replace(/\D/g, ''), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }

    this.cowId = `COW-${String(nextNumber).padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Cow = mongoose.model('Cow', cowSchema);
export default Cow;
