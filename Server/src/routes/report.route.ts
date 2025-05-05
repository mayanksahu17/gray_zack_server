import { Router } from 'express';
import { getDashboardSummary, getRevenueBreakdown } from '../controller/report.controller';

const router = Router();

router.get('/summary', getDashboardSummary);
router.get('/revenue-breakdown', getRevenueBreakdown);

export default router;
