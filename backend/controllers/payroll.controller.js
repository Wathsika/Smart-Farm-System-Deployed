import Employee from "../models/Employee.js";
import PayrollSettings from "../models/PayrollSettings.js";
import PayrollDraft from "../models/PayrollDraft.js";
import PaymentSlip from "../models/PaymentSlip.js";

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

function compute({ basicSalary, allowances, loan }, rules) {
  const salary = Number(basicSalary) || 0;
  const days = Number(rules.daysPerMonth);
  const hrsDay = Number(rules.hoursPerDay);
  const hourly = days > 0 && hrsDay > 0 ? salary / days / hrsDay : 0;

  // OT hours not collected from UI → 0 (you can extend later)
  const otTotal = 0;

  const epf = r2(salary * Number(rules.epfRate));
  const etf = r2(salary * Number(rules.etfRate));
  const gross = r2(salary + (Number(allowances) || 0) + otTotal);
  const net = r2(Math.max(0, gross - epf - (Number(loan) || 0)));

  return { otTotal, epf, etf, gross, net };
}

export const listPaymentSlips = async (req, res) => {
  try {
    const { month, year } = req.query || {};
    const filter = {};

    if (month !== undefined && month !== "") {
      const parsedMonth = Number(month);
      if (
        !Number.isInteger(parsedMonth) ||
        parsedMonth < 1 ||
        parsedMonth > 12
      ) {
        return res.status(400).json({ message: "Invalid month parameter" });
      }
      filter.month = parsedMonth;
    }

    if (year !== undefined && year !== "") {
      const parsedYear = Number(year);
      if (
        !Number.isInteger(parsedYear) ||
        parsedYear < 1900 ||
        parsedYear > 3000
      ) {
        return res.status(400).json({ message: "Invalid year parameter" });
      }
      filter.year = parsedYear;
    }

    const slips = await PaymentSlip.find(filter)
      .populate({
        path: "employee",
        populate: { path: "user", select: "fullName empId" },
        select:
          "basicSalary workingHours allowances allowance loan user empId name",
      })
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean();

    const rows = slips.map((doc) => {
      const employeeDoc = doc.employee;
      const userDoc = employeeDoc?.user;
      const employeeId = employeeDoc?._id ? String(employeeDoc._id) : null;

      const employee = {
        id: employeeId,
        empId:
          userDoc?.empId ||
          employeeDoc?.empId ||
          (employeeId ? employeeId.slice(-6) : "Unknown"),
        name: userDoc?.fullName || employeeDoc?.name || "Unknown",
      };

      return {
        id: String(doc._id),
        slipId: doc.slipId || null,
        employee,
        month: doc.month,
        year: doc.year,
        basicSalary: Number(doc.basicSalary) || 0,
        workingHours: Number(doc.workingHours) || 0,
        allowances: Number(doc.allowances ?? doc.allowance ?? 0),
        loan: Number(doc.loan ?? 0),
        otTotal: Number(doc.otTotal ?? 0),
        epf: Number(doc.epf ?? 0),
        etf: Number(doc.etf ?? 0),
        gross: Number(doc.gross ?? 0),
        netSalary: Number(doc.net ?? doc.netSalary ?? 0),
        status: String(doc.status || "PENDING").toUpperCase(),
        updatedAt: doc.updatedAt || doc.createdAt || null,
      };
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /payrolls/preview
 * body: { draftKey, month, year, employeeIds: [...] }
 * - compute using settings
 * - UPSERT a draft (temporary)
 * - return { draftId, items }
 */
export const previewPayroll = async (req, res) => {
  try {
    const { draftKey, month, year, employeeIds } = req.body || {};
    if (
      !draftKey ||
      !month ||
      !year ||
      !Array.isArray(employeeIds) ||
      !employeeIds.length
    ) {
      return res
        .status(400)
        .json({ message: "draftKey, month, year, employeeIds[] required" });
    }

    const settings = await PayrollSettings.findOne().lean();
    if (!settings)
      return res
        .status(400)
        .json({ message: "Payroll settings not configured" });

    const emps = await Employee.find({ _id: { $in: employeeIds } })
      .populate({ path: "user", select: "fullName empId" })
      .lean();

    const items = emps.map((e) => {
      const allowances = Number(e.allowances ?? 0);
      const loan = Number(e.loan ?? 0);
      const calc = compute(
        { basicSalary: e.basicSalary, allowances, loan },
        settings
      );

      return {
        employee: {
          id: e._id,
          empId: e.user?.empId || String(e._id).slice(-6),
          name: e.user?.fullName || "Unknown",
        },
        basicSalary: Number(e.basicSalary) || 0,
        workingHours: Number(e.workingHours) || 0,
        allowances,
        loan,
        ...calc,
        status: "PENDING",
      };
    });

    const draft = await PayrollDraft.findOneAndUpdate(
      { draftKey, month, year },
      {
        draftKey,
        month,
        year,
        items,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000), // refresh TTL
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ draftId: String(draft._id), items: draft.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /payrolls/commit
 * body: { draftId }
 * - read draft, create/update PaymentSlip per row
 * - delete draft
 * - return saved slips for UI (optional)
 */
export const commitPayroll = async (req, res) => {
  try {
    const { draftId } = req.body || {};
    if (!draftId) return res.status(400).json({ message: "draftId required" });

    const draft = await PayrollDraft.findById(draftId).lean();
    if (!draft) return res.status(404).json({ message: "Draft not found" });

    const { month, year, items } = draft;

    const saved = [];

    const slipMonth = String(month).padStart(2, "0");
    const slipPrefix = `SLP${year}${slipMonth}`;
    // Compute last sequence for this prefix
    const existing = await PaymentSlip.find(
      { year, month, slipId: new RegExp(`^${slipPrefix}`) },
      { slipId: 1 }
    ).lean();
    let lastSequence = 0;
    for (const d of existing) {
      const suffix = String(d.slipId || "").slice(slipPrefix.length);
      const n = Number(suffix);
      if (Number.isFinite(n) && n > lastSequence) lastSequence = n;
    }

    for (const it of items) {
      lastSequence += 1;
      const slipId = `${slipPrefix}${lastSequence}`;

      const doc = await PaymentSlip.findOneAndUpdate(
        { employee: it.employee.id, month, year },
        {
          employee: it.employee.id,
          month,
          year,
          basicSalary: it.basicSalary,
          workingHours: it.workingHours,
          allowances: it.allowances,
          loan: it.loan,
          otTotal: it.otTotal,
          epf: it.epf,
          etf: it.etf,
          gross: it.gross,
          net: it.net,
          status: "SAVED",
          $setOnInsert: { slipId },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();

      saved.push(doc);
    }

    await PayrollDraft.deleteOne({ _id: draftId });

    res.json({ ok: true, count: saved.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
