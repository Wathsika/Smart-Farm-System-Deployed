// /backend/controllers/input.controller.js
import Input from '../models/Input.js';

export const create = async (req,res)=>{
  const doc = await Input.create(req.body);
  res.status(201).json(doc);
};

export const list = async (req,res)=>{
  const { category, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: 'i' };
  const docs = await Input.find(filter).sort('-createdAt');
  res.json(docs);
};

export const one = async (req,res)=> res.json(await Input.findById(req.params.id));

export const update = async (req,res)=>{
  const doc = await Input.findByIdAndUpdate(req.params.id, req.body, { new:true });
  res.json(doc);
};

export const remove = async (req,res)=>{
  await Input.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
};

export default { create, list, one, update, remove };
