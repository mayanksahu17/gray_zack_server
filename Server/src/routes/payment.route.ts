import { Router } from 'express';
import { verifyJWT } from "../middleware/auth.middleware";
import { makePayment } from '../controller/payment.controller';

const router: Router = Router();

/**
 * @swagger
 * /api/v1/payment/make-payment:
 *   post:
 *     summary: Make a payment for a reservation or service
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestId:
 *                 type: string
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *                 example: "credit_card"
 *             required:
 *               - guestId
 *               - amount
 *               - method
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/make-payment', makePayment);

export default router;
