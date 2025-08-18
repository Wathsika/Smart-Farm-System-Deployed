// /backend/routes/input.routes.js
import { Router } from 'express';
import { create, list, one, update, remove } from '../controllers/input.controller.js';
import { auth, isAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, isAdmin, create);
router.get('/', auth, list);
router.get('/:id', auth, one);
router.put('/:id', auth, isAdmin, update);
router.delete('/:id', auth, isAdmin, remove);

export default router;
