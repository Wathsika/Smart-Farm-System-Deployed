// backend/routes/cropRoutes.js

import express from 'express';
import { addCrop, getAllCrops, getCropById,updateCrop, deleteCrop } from '../controllers/crop.controller.js';



const router = express.Router();


router.post('/add', addCrop); 
router.post('/add', addCrop);
router.get('/', getAllCrops);
router.get('/:id', getCropById);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);

export default router;