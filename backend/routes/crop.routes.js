// backend/routes/cropRoutes.js

import express from 'express';
import { addCrop, getAllCrops, deleteCrop } from '../controllers/crop.controller.js'; 



const router = express.Router();


router.post('/add', addCrop); 
router.get('/', getAllCrops);
router.delete('/:id', deleteCrop);

export default router;