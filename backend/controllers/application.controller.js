const Application = require('../models/ApplicationRecord');
const Product = require('../models/Product');

exports.create = async (req,res)=> {
  const rec = await Application.create(req.body);
  if (req.body.product && req.body.quantityUsed?.amount) {
    await Product.findByIdAndUpdate(req.body.product, { $inc: { stockQty: -Math.abs(req.body.quantityUsed.amount) }});
  }
  res.status(201).json(rec);
};

exports.list = async (req,res)=> {
  const { from, to, crop, field } = req.query;
  const filter = {
    ...(from && to ? { date: { $gte: new Date(from), $lte: new Date(to) } } : {}),
    ...(crop && { crop }),
    ...(field && { field })
  };
  const docs = await Application.find(filter).populate('product crop field worker plan');
  res.json(docs);
};
