// backend/routes/health.routes.js
const express = require("express");
const mongoose = require("mongoose");
const ctrl = require("../controllers/health.controller");

const router = express.Router();
const oid = (param = "id") => (req, res, next) => {
  const id = req.params[param];
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: `Invalid ObjectId for ${param}` });
  next();
};

/* analytics */
router.get("/due", ctrl.upcomingDue);

/* CRUD */
router.post("/", ctrl.createHealth);
router.get("/", ctrl.listHealth);
router.get("/:id", oid("id"), ctrl.getHealth);
router.put("/:id", oid("id"), ctrl.updateHealth);
router.delete("/:id", oid("id"), ctrl.deleteHealth);

router.get("/upcoming-due", ctrl.upcomingDue);

module.exports = router;
