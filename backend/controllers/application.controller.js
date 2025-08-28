// ✅ Corrected and Complete File: /backend/controllers/application.controller.js

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


/**
 * ==========================================================
 * === START: This is the new function that was missing    ===
 * ==========================================================
 *
 * @desc    Get all application records for a specific field ID
 * @route   GET /api/applications/field/:fieldId
 */
export const listByField = async (req, res) => {
  try {
    // Find all documents in the 'Application' collection where the 'field'
    // property matches the 'fieldId' that comes from the URL parameters.
    const docs = await Application
      .find({ field: req.params.fieldId })
      .populate('product', 'name category'); // Also fetch the name and category of the product used

    if (!docs) {
      // If nothing is found, it's not an error, just return an empty list.
      return res.status(200).json([]);
    }

    return res.json(docs);
  } catch (err) {
    console.error('List Applications by Field error:', err);
    return res.status(500).json({ message: 'Failed to fetch application records for this field' });
  }
};
/**
 * ==========================================================
 * === END: End of the new function                         ===
 * ==========================================================
 */


// --- IMPORTANT: The default export is updated to include the new function ---
export default { create, list, listByField };