import express from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { getSalesReport, getInventoryReport, getCustomerReport } from '../controllers/report.controller.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('Admin'));

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/customers', getCustomerReport);

export default router;