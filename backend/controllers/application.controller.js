// /backend/controllers/application.controller.js

import Application from '../models/ApplicationRecord.js';
import Product from '../models/Input.js';

/**
 * Create an application record and deduct stock from the product.
 */
export const create = async (req, res) => {
  try {
    const rec = await Application.create(req.body);

    const productId = req.body?.product;
    const usedAmount = req.body?.quantityUsed?.amount;

    if (productId && typeof usedAmount === 'number') {
      // Deduct from stock (uses `stockQty` field on Input model)
      await Product.findByIdAndUpdate(productId, {
        $inc: { stockQty: -Math.abs(usedAmount) },
      });
    }

    return res.status(201).json(rec);
  } catch (err) {
    console.error('Create Application error:', err);
    return res.status(500).json({ message: 'Failed to create application record' });
  }
};

/**
 * List application records with optional filters: from, to, crop, field
 */
export const list = async (req, res) => {
  try {
    const { from, to, crop, field } = req.query;

    const filter = {
      ...(from && to ? { date: { $gte: new Date(from), $lte: new Date(to) } } : {}),
      ...(crop ? { crop } : {}),
      ...(field ? { field } : {}),
    };

    const docs = await Application
      .find(filter)
      .populate('product crop field worker plan');

    return res.json(docs);
  } catch (err) {
    console.error('List Applications error:', err);
    return res.status(500).json({ message: 'Failed to fetch application records' });
  }
};

// Keep default export for route files that import `ctrl` as default
export default { create, list };
