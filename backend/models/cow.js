import mongoose from 'mongoose';

const cowSchema = new mongoose.Schema(
  {
    cowId: { type: String, unique: true, index: true },
    name: { type: String, required: [true, "Please add the cow's name"] },
    breed: { type: String, required: [true, "Please add the cow's breed"] },
    gender: {
      type: String,
      enum: ["Female", "Male"],
      required: [true, "Please select gender"],
    },
    bday: {
      type: Date,
      required: [true, "Please add the cow's birth date"],
      validate: {
        validator: (v) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return v <= today;
        },
        message: "Birth date cannot be in the future",
      },
    },
    photoUrl: { type: String, default: "" },
    qrUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto increment cowId
cowSchema.pre("save", async function (next) {
  if (this.cowId) return next();
  const last = await mongoose.model("Cow").findOne().sort({ cowId: -1 });
  let nextNum = 1;
  if (last?.cowId) {
    const num = parseInt(last.cowId.replace(/\D/g, ""), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }
  this.cowId = `COW-${String(nextNum).padStart(4, "0")}`;
  next();
});

const Cow = mongoose.model("Cow", cowSchema);
export default Cow;
