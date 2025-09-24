// backend/controllers/milk.controller.js
import mongoose from "mongoose";
import Milk from "../models/milk.js";
import Cow from "../models/cow.js";

// normalize any input date to local midnight
function startOfDay(input) {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0); // local midnight
  }
  const d = new Date(input);
  if (isNaN(+d)) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

// create new milk record
export const createMilk = async (req, res, next) => {
  try {
    const { cow, date, shift = "AM", volumeLiters } = req.body;

    if (!cow || !date || volumeLiters == null) {
      return res.status(400).json({ message: "cow, date, volumeLiters are required" });
    }
    const d = startOfDay(date);
    if (!d) return res.status(400).json({ message: "Invalid date" });

    // make sure cow exists
    const exists = await Cow.exists({ _id: cow });
    if (!exists) return res.status(404).json({ message: "Cow not found" });

    const doc = await Milk.create({ cow, date: d, shift, volumeLiters });
    res.status(201).json(doc);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Record already exists for this cow/date/shift" });
    }
    next(err);
  }
};

export const listMilk = async (req, res, next) => {
  try {
    const { cow, shift, from, to, page = 1, limit = 20 } = req.query;
    const q = {};
    if (cow) q.cow = cow;
    if (shift && (shift === "AM" || shift === "PM")) q.shift = shift;
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = startOfDay(from);
      if (to) {
        const t = startOfDay(to);
        if (t) t.setDate(t.getDate() + 1); 
        q.date.$lt = t;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Milk.find(q)
        .populate("cow", "name tagId breed")
        .sort({ date: -1, shift: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Milk.countDocuments(q),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const getMilk = async (req, res, next) => {
  try {
    const doc = await Milk.findById(req.params.id).populate("cow", "name tagId breed gender bday");
    if (!doc) return res.status(404).json({ message: "Record not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// edit milk record
export const updateMilk = async (req, res, next) => {
  try {
    const payload = {};
  if (req.body.cow) payload.cow = req.body.cow;
  if (req.body.shift && (req.body.shift === "AM" || req.body.shift === "PM")) {
    payload.shift = req.body.shift;
  }
  if (req.body.volumeLiters != null) payload.volumeLiters = req.body.volumeLiters;
   if (req.body.date) payload.date = req.body.date; 
    if (payload.date) {
      const d = startOfDay(payload.date);
      if (!d) return res.status(400).json({ message: "Invalid date" });
      payload.date = d;
    }
    const updated = await Milk.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    });
    if (!updated) return res.status(404).json({ message: "Record not found" });
    res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate cow/date/shift after update" });
    }
    next(err);
  }
};

// delete milk record
export const deleteMilk = async (req, res, next) => {
  try {
    const del = await Milk.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Record not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

/*  Analytics / Summaries  */

// Farm daily totals between dates
export const farmDailyTotals = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const match = {};
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = startOfDay(from);
      if (to) {
        const t = startOfDay(to);
        if (t) t.setDate(t.getDate() + 1);
        match.date.$lt = t;
      }
    }
    const data = await Milk.aggregate([
      { $match: match },
      { $group: { _id: "$date", totalLiters: { $sum: "$volumeLiters" }, entries: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", totalLiters: 1, entries: 1, _id: 0 } },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Per-cow daily totals with AM/PM split
export const cowDailyTimeline = async (req, res, next) => {
  try {
    const cowId = req.params.cowId;
    const { from, to } = req.query;

    const match = { cow: new mongoose.Types.ObjectId(cowId) };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = startOfDay(from);
      if (to) {
        const t = startOfDay(to);
        if (t) t.setDate(t.getDate() + 1);
        match.date.$lt = t;
      }
    }

    const data = await Milk.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$date",
          liters: { $sum: "$volumeLiters" },
          am: { $sum: { $cond: [{ $eq: ["$shift", "AM"] }, "$volumeLiters", 0] } },
          pm: { $sum: { $cond: [{ $eq: ["$shift", "PM"] }, "$volumeLiters", 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", liters: 1, am: 1, pm: 1, _id: 0 } },
    ]);

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Monthly totals & averages for one cow
export const cowMonthlyStats = async (req, res, next) => {
  try {
    const cowId = req.params.cowId;
    const { year } = req.query;

    const match = { cow: new mongoose.Types.ObjectId(cowId) };
    if (year) {
      const from = startOfDay(`${year}-01-01`);
      const to = startOfDay(`${Number(year) + 1}-01-01`);
      match.date = { $gte: from, $lt: to };
    }

    const data = await Milk.aggregate([
      { $match: match },
      { $group: { _id: { y: { $year: "$date" }, m: { $month: "$date" } }, total: { $sum: "$volumeLiters" }, days: { $addToSet: "$date" } } },
      { $project: { year: "$_id.y", month: "$_id.m", total: 1, daysRecorded: { $size: "$days" }, avgPerDay: { $divide: ["$total", { $size: "$days" }] }, _id: 0 } },
      { $sort: { year: 1, month: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    next(err);
  }
};
