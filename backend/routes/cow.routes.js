import express from 'express';
import {
  addCow,
  listCows,
  getCow,
  updateCow,
  deleteCow,
  regenerateCowQR,   
} from '../controllers/cow.controller.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// routes
router.get('/', listCows);                              // list
router.post('/', upload.single("photo"), addCow);       // add new cow
router.get('/:id', getCow);                             // display one
router.put('/:id', upload.single("photo"), updateCow);  // edit
router.delete('/:id', deleteCow);                       // delete
router.post('/:id/qr', regenerateCowQR);                // regenerate QR code

export default router;
