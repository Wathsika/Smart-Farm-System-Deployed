import mongoose from "mongoose";

const breedingSchema = new mongoose.Schema(
  {
    cow: { type: mongoose.Schema.Types.ObjectId, ref: "Cow", required: true, index: true },

    // What happened in the breeding timeline
    eventType: {
      type: String,
      enum: [
        "heat",             // observed heat
        "insemination",     // AI or natural mating
        "pregnancy_check",  // PD @30–45d
        "calving",          // parturition
        "abortion"          // pregnancy loss
      ],
      required: true,
      index: true
    },

    // Insemination / mating details
    method: { type: String, enum: ["AI", "Natural", "EmbryoTransfer", "Unknown"], default: "Unknown" },
    serviceDate: { type: Date },             // insemination / mating date
    technician: { type: String },
    semenBatch: { type: String },
    sireId: { type: String },                // bull ID / straw code
    sireBreed: { type: String },

    // Heat observation (if recorded)
    heatStart: { type: Date },
    heatEnd: { type: Date },

    // Pregnancy diagnosis
    pregCheckDate: { type: Date },
    pregResult: { type: String, enum: ["Positive", "Negative", "Inconclusive", "Unknown"], default: "Unknown" },

    // Calving info
    calvingDate: { type: Date },
    calfSex: { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
    calfId: { type: String },                // if you create Calf docs later, keep a ref instead
    calfWeightKg: { type: Number, min: 0 },

    // Computed dates / reminders
    expectedCalvingDate: { type: Date },     // auto = serviceDate + 283d (if AI/Natural and preg positive/unknown yet)
    nextDueName: { type: String },           // e.g., "Pregnancy Check", "Calving"
    nextDueDate: { type: Date },

    // Status/notes
    status: { type: String, enum: ["Planned", "Done", "Failed", "Cancelled"], default: "Planned", index: true },
    notes: { type: String },

  },
  { timestamps: true }
);

/* Helpers */
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/* Auto-calc expectedCalvingDate + nextDue */
breedingSchema.pre("save", function (next) {
  // For insemination events, seed EDD
  if (this.eventType === "insemination" && this.serviceDate && !this.expectedCalvingDate) {
    this.expectedCalvingDate = addDays(this.serviceDate, 283);
  }

  // Next due logic (simple baseline rules)
  if (this.eventType === "insemination") {
    // default: pregnancy check due at day 35 post-service
    this.nextDueName = "Pregnancy Check";
    this.nextDueDate = addDays(this.serviceDate, 35);
  }
  if (this.eventType === "pregnancy_check" && this.pregResult === "Positive" && this.serviceDate) {
    // After positive PD, next due is calving (EDD)
    this.nextDueName = "Calving (EDD)";
    this.nextDueDate = this.expectedCalvingDate || addDays(this.serviceDate, 283);
  }
  if (this.eventType === "calving") {
    this.nextDueName = undefined;
    this.nextDueDate = undefined;
    this.status = "Done";
  }

  next();
});

breedingSchema.index({ cow: 1, eventType: 1, serviceDate: -1 });
breedingSchema.index({ nextDueDate: 1 });

const Breeding = mongoose.models.Breeding || mongoose.model("Breeding", breedingSchema);

export default Breeding;
