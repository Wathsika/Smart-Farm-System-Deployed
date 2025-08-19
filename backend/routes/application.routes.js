// /backend/routes/application.routes.js
import { Router } from 'express';
import { create, list } from '../controllers/application.controller.js';
// The auth middleware is kept imported but is commented out in the routes below.
import { auth } from '../middlewares/auth.js';

const router = Router();

// --- Temporarily disabled auth middleware for development ---
// TODO: Uncomment 'auth' before final deployment.
router.post('/', /* auth, */ create);
router.get('/', /* auth, */ list);
// --- End of temporarily disabled section ---

export default router;