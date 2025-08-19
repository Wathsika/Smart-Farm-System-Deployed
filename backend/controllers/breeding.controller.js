const mongoose = require("mongoose");
const Breeding = require("../models/breeding");
const Cow = require("../models/cow"); // optional: to validate cow exists

/* Create */
exports.createBreeding = async (req, res, next) => {
  try {
    const body = req.body;

    // Basic validations
    if (!body.cow || !mongoose.Types.ObjectId.isValid(body.cow)) {
      return res.status(400).json({ message: "Valid cow id is required" });
    }
    if (!body.eventType) {
      return res.status(400).json({ message: "eventType is required" });
    }

    // Optional: ensure cow exists
    const cowExists = await Cow.exists({ _id: body.cow });
    if (!cowExists) return res.status(404).json({ message: "Cow not found" });

    const doc = await Breeding.create(body);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

/* List with filters */
exports.listBreeding = async (req, res, next) => {
  try {
    const { cow, eventType, status, from, to, dueFrom, dueTo, limit = 50, page = 1 } = req.query;
    const q = {};

    if (cow && mongoose.Types.ObjectId.isValid(cow)) q.cow = cow;
    if (eventType) q.eventType = eventType;
    if (status) q.status = status;
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }
    if (dueFrom || dueTo) {
      q.nextDueDate = {};
      if (dueFrom) q.nextDueDate.$gte = new Date(dueFrom);
      if (dueTo) q.nextDueDate.$lte = new Date(dueTo);
    }

    const docs = await Breeding.find(q)
      .populate("cow", "cowId name breed gender bday")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 50, 200))
      .skip((Number(page) - 1) * (Number(limit) || 50));

    res.json(docs);
  } catch (err) {
    next(err);
  }
};

/* Get one */
exports.getBreeding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Breeding.findById(id).populate("cow", "cowId name breed gender bday");
    if (!doc) return res.status(404).json({ message: "Breeding record not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

/* Update */
exports.updateBreeding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // If event type/date changes, let schema hook recalc nextDue* etc.
    let doc = await Breeding.findById(id);
    if (!doc) return res.status(404).json({ message: "Breeding record not found" });

    Object.assign(doc, body);
    await doc.save();

    res.json(doc);
  } catch (err) {
    next(err);
  }
};

/* Delete */
exports.deleteBreeding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ok = await Breeding.findByIdAndDelete(id);
    if (!ok) return res.status(404).json({ message: "Breeding record not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

/* ------- Analytics / helper endpoints ------- */

/** Upcoming dues (preg check, calvings) within a window */
exports.upcomingDue = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + Number(days));

    const docs = await Breeding.find({
      nextDueDate: { $gte: from, $lte: to }
    })
      .populate("cow", "cowId name breed")
      .sort({ nextDueDate: 1 });

    res.json(docs);
  } catch (err) {
    next(err);
  }
};

/** Repeat breeders: cows with >=3 inseminations in last 90 days */
exports.repeatBreeders = async (_req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const agg = await Breeding.aggregate([
      { $match: { eventType: "insemination", serviceDate: { $gte: since } } },
      { $group: { _id: "$cow", count: { $sum: 1 }, lastService: { $max: "$serviceDate" } } },
      { $match: { count: { $gte: 3 } } },
      {
        $lookup: {
          from: "cows",
          localField: "_id",
          foreignField: "_id",
          as: "cow"
        }
      },
      { $unwind: "$cow" },
      { $project: { count: 1, lastService: 1, "cow._id": 1, "cow.cowId": 1, "cow.name": 1, "cow.breed": 1 } },
      { $sort: { count: -1 } }
    ]);

    res.json(agg);
  } catch (err) {
    next(err);
  }
};
