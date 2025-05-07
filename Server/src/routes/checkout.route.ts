import { Router } from 'express';
import { getCheckoutDetails, processCheckout, getCheckoutHistory } from '../controller/checkout.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/checkout/guest/{userId}:
 *   get:
 *     summary: Get checkout details for a guest
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the guest
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Checkout details fetched successfully
 */
router.get('/guest/:userId', getCheckoutDetails);

/**
 * @swagger
 * /api/v1/checkout/process:
 *   post:
 *     summary: Process guest checkout and payment
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               amount:
 *                 type: number
 *             required:
 *               - userId
 *               - paymentMethod
 *               - amount
 *     responses:
 *       200:
 *         description: Checkout processed successfully
 */
router.post('/process', processCheckout);

/**
 * @swagger
 * /api/v1/checkout/history/{userId}:
 *   get:
 *     summary: Get checkout history for a guest
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the guest
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Checkout history fetched successfully
 */
router.get('/history/:userId', getCheckoutHistory);

export default router;
