const mongoose = require('mongoose');
const Cow = require('../models/cow');

const addCow = async (req, res, next) => {
  try {
    let { name, breed, bday, gender } = req.body;

    if (!name || !breed || !bday || !gender) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }
    const cow = await Cow.create({ name, breed, bday: d, gender }); // cowId auto if your model has it
    return res.status(201).json(cow);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return next(err);
  }
};

//
const listCows = async (_req, res, next) => {
  try {
    const cows = await Cow.find().sort({ createdAt: -1 });
    res.json(cows);
  } catch (err) {
    next(err);
  }
};

//
const getCow = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid id' });

    const cow = await Cow.findById(id);
    if (!cow) return res.status(404).json({ message: 'Cow not found' });
    res.json(cow);
  } catch (err) { next(err); }
};

// Update cow details
const updateCow = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid id' });

    const { name, breed, bday, gender } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (breed !== undefined) updates.breed = String(breed).trim();
    if (gender !== undefined) updates.gender = gender;
    if (bday !== undefined) {
      const d = new Date(bday);
      if (isNaN(d.getTime())) return res.status(400).json({ message: 'Invalid date for bday' });
      updates.bday = d;
    }

    const cow = await Cow.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!cow) return res.status(404).json({ message: 'Cow not found' });
    res.json(cow);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
    next(err);
  }
};

// Delete a cow
const deleteCow = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid id' });

    const cow = await Cow.findByIdAndDelete(id);
    if (!cow) return res.status(404).json({ message: 'Cow not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
};

module.exports = { addCow, listCows, getCow, updateCow, deleteCow };