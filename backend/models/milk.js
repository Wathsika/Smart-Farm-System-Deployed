
import mongoose from "mongoose";

const oneDp = (v) => {
  const n = Number(v);
  return isFinite(n) ? n.toFixed(1) : "";
};
// allow numbers like "", "0", "12", "12.", "12.3", "12.34" (max 2 dp)
const allowTwoDp = (s) => /^\d*(\.\d{0,2})?$/.test(s);

const milkSchema = new mongoose.Schema(
  {
    cow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cow",
      required: [true, "Cow is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
      validate: {
        validator(v) {
          if (!(v instanceof Date) || isNaN(v)) return false;
          const d = new Date(v); d.setHours(0,0,0,0);
          const t = new Date(); t.setHours(0,0,0,0);
          return d <= t; // not future
        },
        message: "Date cannot be in the future",
      },
    },
    shift: { type: String, enum: ["AM","PM"], default: "AM", index: true },
    volumeLiters: {
      type: Number,
      required: [true, "Milk volume (L) is required"],
      min: [0, "Volume must be >= 0"],
      set: (v) => Math.round(Number(v) * 100) / 100, // keep 2 decimals max
    },


  },
  { timestamps: true, strict: true }
);


// Normalize date to midnight to ensure unique index works reliably
milkSchema.pre("validate", function(next) {
  if (this.date instanceof Date && !isNaN(this.date)) {
    const d = new Date(this.date); d.setHours(0,0,0,0);
    this.date = d;
  }
  next();
});

// avoid duplicates for same cow + day + shift

milkSchema.index({ cow: 1, date: 1, shift: 1 }, { unique: true });

const Milk = mongoose.models.Milk || mongoose.model("Milk", milkSchema);
export default Milk;
