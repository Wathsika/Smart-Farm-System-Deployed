import express from 'express';
import {
    getAllDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
   getActiveDiscount,
    validateDiscount

} from '../controllers/discount.controller.js';

const router = express.Router();

// --- THIS IS THE FIX ---
// Add the express.json() middleware. This will parse the JSON body
// for the POST and PUT requests defined below.
router.use(express.json());

// GET /api/discounts/active
router.get('/active', getActiveDiscount);

// POST /api/discounts/validate
router.post('/validate', validateDiscount);

// GET /api/discounts
router.get('/', getAllDiscounts);

// POST /api/discounts
router.post('/', createDiscount);

// PUT /api/discounts/:id
router.put('/:id', updateDiscount);

// DELETE /api/discounts/:id
router.delete('/:id', deleteDiscount);

export default router;