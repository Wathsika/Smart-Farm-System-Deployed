import PayrollSettings from "../models/PayrollSettings.js";

/** Normalize and coerce all numeric fields safely */
function coerceSettings(body = {}) {
  const num = (v) =>
    v === "" || v === null || v === undefined ? NaN : Number(v);

  const coerced = {
    daysPerMonth: num(body.daysPerMonth),
    hoursPerDay: num(body.hoursPerDay),
    otWeekdayMultiplier: num(body.otWeekdayMultiplier),
    otHolidayMultiplier: num(body.otHolidayMultiplier),
    epfRate: num(body.epfRate),
    etfRate: num(body.etfRate),
  };

  // basic validation (you can extend if needed)
  const errors = [];
  const pushIf = (cond, msg) => cond && errors.push(msg);

  pushIf(
    !(coerced.daysPerMonth >= 0),
    "daysPerMonth must be a non‑negative number"
  );
  pushIf(
    !(coerced.hoursPerDay >= 0),
    "hoursPerDay must be a non‑negative number"
  );
  pushIf(
    !(coerced.otWeekdayMultiplier >= 0),
    "otWeekdayMultiplier must be ≥ 0"
  );
  pushIf(
    !(coerced.otHolidayMultiplier >= 0),
    "otHolidayMultiplier must be ≥ 0"
  );
  pushIf(
    !(coerced.epfRate >= 0 && coerced.epfRate <= 1),
    "epfRate must be between 0 and 1 (e.g., 0.08 for 8%)"
  );
  pushIf(
    !(coerced.etfRate >= 0 && coerced.etfRate <= 1),
    "etfRate must be between 0 and 1 (e.g., 0.03 for 3%)"
  );

  return { coerced, errors };
}

/** GET /api/payroll/settings */
export async function getPayrollSettings(req, res) {
  try {
    let doc = await PayrollSettings.findOne({ key: "singleton" }).lean();

    // Create with defaults if missing (matches your frontend defaults)
    if (!doc) {
      doc = await PayrollSettings.create({
        key: "singleton",
        daysPerMonth: 28,
        hoursPerDay: 8,
        otWeekdayMultiplier: 1.5,
        otHolidayMultiplier: 2.0,
        epfRate: 0.08,
        etfRate: 0.03,
      });
      // convert to plain object for consistent return
      doc = doc.toObject();
    }

    // strip key before returning
    // eslint-disable-next-line no-unused-vars
    const { key, ...clean } = doc;
    return res.json(clean);
  } catch (err) {
    console.error("GET /payroll/settings error:", err);
    return res.status(500).json({ message: "Failed to load payroll settings" });
  }
}

/** PUT /api/payroll/settings */
export async function updatePayrollSettings(req, res) {
  try {
    const { coerced, errors } = coerceSettings(req.body);
    if (errors.length)
      return res.status(400).json({ message: "Validation failed", errors });

    const updated = await PayrollSettings.findOneAndUpdate(
      { key: "singleton" },
      { key: "singleton", ...coerced },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // strip key before returning
    // eslint-disable-next-line no-unused-vars
    const { key, ...clean } = updated;
    return res.json(clean);
  } catch (err) {
    console.error("PUT /payroll/settings error:", err);
    return res.status(500).json({ message: "Failed to save payroll settings" });
  }
}
