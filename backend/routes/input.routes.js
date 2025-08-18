import { Router } from 'express';
import ctrl from '../controllers/input.controller.js';
import { auth, isAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, isAdmin, ctrl.create);
router.get('/', auth, ctrl.list);
router.get('/:id', auth, ctrl.one);
router.put('/:id', auth, isAdmin, ctrl.update);
router.delete('/:id', auth, isAdmin, ctrl.remove);

export default router;
