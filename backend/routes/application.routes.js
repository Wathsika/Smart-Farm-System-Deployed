import { Router } from 'express';
import { create, list } from '../controllers/application.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, create);
router.get('/', auth, list);

export default router;
