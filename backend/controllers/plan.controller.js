import Plan from '../models/ApplicationPlan.js';
import { isDue } from '../utils/schedule.js';

export const create = async (req, res) =>
  res.status(201).json(await Plan.create(req.body));


export const list = async (req, res) => {
  const { crop, field, active } = req.query;
  const filter = { ...(crop && { crop }), ...(field && { field }) };
  if (active !== undefined) filter.active = active === 'true';
  const docs = await Plan.find(filter).populate('product crop field');
  res.json(docs);
};

export const due = async (req,res)=> {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const plans = await Plan.find({ active: true }).populate('product crop field');
  res.json(plans.filter((p) => isDue(p.schedule, date)));
};

export const toggle = async (req,res)=> {
  const plan = await Plan.findById(req.params.id);
  plan.active = !plan.active;
  await plan.save();
  res.json(plan);
};

export const remove = async (req, res) => {
  await Plan.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
};

export default { create, list, due, toggle, remove };

