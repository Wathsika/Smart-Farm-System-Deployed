import { Router } from 'express';
import ctrl from '../controllers/plan.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, ctrl.create);
router.get('/', auth, ctrl.list);
router.get('/due', auth, ctrl.due);
router.patch('/:id/toggle', auth, ctrl.toggle);
router.delete('/:id', auth, ctrl.remove);

export default router;
