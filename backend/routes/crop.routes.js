// backend/routes/cropRoutes.js

import express from 'express';
import { addCrop, getAllCrops, updateCrop, deleteCrop } from '../controllers/crop.controller.js';



const router = express.Router();


router.post('/add', addCrop); 
router.get('/', getAllCrops);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);

export default router;