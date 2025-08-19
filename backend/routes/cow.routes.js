import express from 'express';
import {
  addCow,
  listCows,
  getCow,
  updateCow,
  deleteCow,
} from '../controllers/cow.controller.js';

const router = express.Router();

router.get('/', listCows);        // list
router.post('/', addCow);         // create
router.get('/:id', getCow);       // display one
router.put('/:id', updateCow);    // edit
router.delete('/:id', deleteCow); // delete

export default router;
