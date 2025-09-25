// ✅ Corrected and Complete File: backend/controllers/plan.controller.js

import Plan from '../models/ApplicationPlan.js';
import { isDue } from '../utils/schedule.js';

// --- Create a new plan ---
export const create = async (req, res) => {
  try {
    const doc = await Plan.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- List all plans with optional filters ---
export const list = async (req, res) => {
  try {
    const { crop, field, active } = req.query;
    const filter = {
      ...(crop && { crop }),
      ...(field && { field }),
    };
    if (active !== undefined) filter.active = active === 'true';

    const docs = await Plan.find(filter).populate('product crop field');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Show single plan by ID ---
// This is the function that your Edit Page needs.
export const show = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate('product crop field');
    if (!plan) {
      // Send a clear 404 status if not found
      return res.status(404).json({ message: 'Plan not found.' });
    }
    res.json(plan);
  } catch (err) {
    // Catch potential errors like invalid ID format
    res.status(500).json({ error: 'Server error while fetching plan.' });
  }
};

// --- List only due plans ---
export const due = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const plans = await Plan.find({ active: true }).populate('product crop field');
    const duePlans = plans.filter((p) => isDue(p.schedule, date));
    res.json(duePlans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Toggle plan active/inactive ---
export const toggle = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.sendStatus(404);

    plan.active = !plan.active;
    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Remove plan by ID ---
export const remove = async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Default export is now guaranteed to include 'show' ---
export default { create, list, show, due, toggle, remove };