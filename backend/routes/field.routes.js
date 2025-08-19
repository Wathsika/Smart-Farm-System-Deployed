// backend/routes/field.routes.js
import express from 'express';
import { addField, getAllFields, getFieldById, updateField, deleteField } from '../controllers/field.controller.js';
const router = express.Router();

router.route('/').get(getAllFields).post(addField);
router.route('/:id').get(getFieldById).put(updateField).delete(deleteField);

export default router;