import express from 'express';
import {
  addCow,
  listCows,
  getCow,
  updateCow,
  deleteCow,
} from '../controllers/cow.controller.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', listCows);        // list
router.post('/', upload.single("photo"), addCow); // add new cow
router.get('/:id', getCow);       // display one
router.put('/:id', upload.single("photo"), updateCow);    // edit
router.delete('/:id', deleteCow); // delete

export default router;
