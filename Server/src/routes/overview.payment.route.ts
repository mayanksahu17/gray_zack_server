import { Router } from 'express';
import { getPaymentsData } from '../controller/overview.payment.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/overview/payments/dashboard/payments-data:
 *   get:
 *     summary: Get aggregated payments data for dashboard
 *     tags: [Payments Overview]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments data retrieved successfully
 */
router.get('/dashboard/payments-data', getPaymentsData);

export default router;
