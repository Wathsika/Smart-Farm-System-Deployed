
const Product = require('../models/Product');

exports.create = async (req,res)=> {
  const doc = await Product.create(req.body);
  res.status(201).json(doc);
};

exports.list = async (req,res)=> {
  const { category, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: 'i' };
  const docs = await Product.find(filter).sort('-createdAt');
  res.json(docs);
};

exports.one = async (req,res)=> res.json(await Product.findById(req.params.id));

exports.update = async (req,res)=> {
  const doc = await Product.findByIdAndUpdate(req.params.id, req.body, { new:true });
  res.json(doc);
};

exports.remove = async (req,res)=> {
  await Product.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
};
