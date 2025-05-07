import express from 'express';
import { getDashboardData } from '../controller/dashboard.data.controller';

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/dashboard:
 *   get:
 *     summary: Get dashboard data for the hotel admin panel
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 */
router.get('/dashboard', getDashboardData);

export default router;
