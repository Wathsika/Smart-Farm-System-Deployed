// /backend/routes/plan.routes.js
import { Router } from 'express';
import { create, list, due, toggle, remove } from '../controllers/plan.controller.js';
// The auth middleware is kept imported but is commented out in the routes below.
import { auth } from '../middlewares/auth.js';

const router = Router();

// --- Temporarily disabled auth middleware for development ---
// TODO: Uncomment 'auth' on all routes before final deployment.
router.post('/', /* auth, */ create);
router.get('/', /* auth, */ list);
router.get('/due', /* auth, */ due);
router.patch('/:id/toggle', /* auth, */ toggle);
router.delete('/:id', /* auth, */ remove);
// --- End of temporarily disabled section ---

export default router;