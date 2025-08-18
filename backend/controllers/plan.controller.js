// --- helper (local to this controller) ---
function sameDay(a,b){ return a.getFullYear()===b.getFullYear() &&
  a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function diffInDays(a,b){ return Math.floor((b-a)/(24*60*60*1000)); }
function isDue(schedule, date = new Date()){
  const { type, startDate, repeatEvery=1, occurrences } = schedule;
  const s = new Date(startDate); const d = new Date(date);
  if (d < new Date(s.getFullYear(), s.getMonth(), s.getDate())) return false;
  if (type==='once') return sameDay(s,d);
  let step = 0;
  if (type==='daily'){ const days=diffInDays(s,d); if(days<0||days%repeatEvery) return false; step=Math.floor(days/repeatEvery); }
  else if (type==='weekly'){ const days=diffInDays(s,d); if(days<0) return false; const w=Math.floor(days/7); if(w%repeatEvery) return false; step=Math.floor(w/repeatEvery); }
  else if (type==='monthly'){ const m=(d.getFullYear()-s.getFullYear())*12+(d.getMonth()-s.getMonth()); if(m<0||m%repeatEvery) return false; step=Math.floor(m/repeatEvery); }
  if (typeof occurrences==='number' && step>=occurrences) return false;
  return true;
}
// --- end helper ---


const Plan = require('../models/ApplicationPlan');
const { isDue } = require('../utils/schedule');

exports.create = async (req,res)=> res.status(201).json(await Plan.create(req.body));

exports.list = async (req,res)=> {
  const { crop, field, active } = req.query;
  const filter = { ...(crop && {crop}), ...(field && {field}) };
  if (active !== undefined) filter.active = active === 'true';
  const docs = await Plan.find(filter).populate('product crop field');
  res.json(docs);
};

exports.due = async (req,res)=> {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const plans = await Plan.find({ active: true }).populate('product crop field');
  res.json(plans.filter(p => isDue(p.schedule, date)));
};

exports.toggle = async (req,res)=> {
  const plan = await Plan.findById(req.params.id);
  plan.active = !plan.active;
  await plan.save();
  res.json(plan);
};

exports.remove = async (req,res)=> { await Plan.findByIdAndDelete(req.params.id); res.sendStatus(204); };
