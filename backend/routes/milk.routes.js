// backend/routes/milk.routes.js
const express = require("express");
const ctrl = require("../controllers/milk.controller");
const mongoose = require("mongoose");

const router = express.Router();

// tiny helper to validate ObjectId parameters
const oid = (param = "id") => (req, res, next) => {
  const id = req.params[param];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid ObjectId for ${param}` });
  }
  next();
};

/* --- analytics first (more specific paths) --- */
router.get("/summary/farm/daily", ctrl.farmDailyTotals);
router.get("/cow/:cowId/daily", oid("cowId"), ctrl.cowDailyTimeline);
router.get("/cow/:cowId/monthly", oid("cowId"), ctrl.cowMonthlyStats);

/* --- CRUD --- */
router.post("/", ctrl.createMilk);
router.get("/", ctrl.listMilk);
router.get("/:id", oid("id"), ctrl.getMilk);
router.put("/:id", oid("id"), ctrl.updateMilk);
router.delete("/:id", oid("id"), ctrl.deleteMilk);

module.exports = router;
