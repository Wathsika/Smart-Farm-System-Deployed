import { Router } from 'express';
import ctrl from '../controllers/application.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, ctrl.create);
router.get('/', auth, ctrl.list);

export default router;
