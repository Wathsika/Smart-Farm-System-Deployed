import { Router } from 'express';
import { create, list, due, toggle, remove } from '../controllers/plan.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, create);
router.get('/', auth, list);
router.get('/due', auth, due);
router.patch('/:id/toggle', auth, toggle);
router.delete('/:id', auth, remove);

export default router;
