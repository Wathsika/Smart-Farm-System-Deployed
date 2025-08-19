const express = require("express");
const mongoose = require("mongoose");
const ctrl = require("../controllers/breeding.controller");

const router = express.Router();

const oid = (param = "id") => (req, res, next) => {
  const id = req.params[param];
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: `Invalid ObjectId for ${param}` });
  next();
};

/* Analytics / helpers */
router.get("/due", ctrl.upcomingDue);
router.get("/repeat-breeders", ctrl.repeatBreeders);

/* CRUD */
router.post("/", ctrl.createBreeding);
router.get("/", ctrl.listBreeding);
router.get("/:id", oid("id"), ctrl.getBreeding);
router.put("/:id", oid("id"), ctrl.updateBreeding);
router.delete("/:id", oid("id"), ctrl.deleteBreeding);

module.exports = router;
