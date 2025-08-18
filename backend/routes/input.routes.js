// /backend/routes/input.routes.js
import { Router } from 'express';
import { create, list, one, update, remove } from '../controllers/input.controller.js';
// The auth middlewares are kept imported but are commented out in the routes below.
import { auth, isAdmin } from '../middlewares/auth.js';

const router = Router();

// --- Temporarily disabled auth middleware for development ---
// TODO: Uncomment 'auth' and 'isAdmin' before final deployment.
router.post('/', /* auth, isAdmin, */ create);
router.get('/', /* auth, */ list);
router.get('/:id', /* auth, */ one);
router.put('/:id', /* auth, isAdmin, */ update);
router.delete('/:id', /* auth, isAdmin, */ remove);
// --- End of temporarily disabled section ---

export default router;