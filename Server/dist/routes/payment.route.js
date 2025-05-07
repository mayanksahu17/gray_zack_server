"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controller/payment.controller");
const router = (0, express_1.Router)();
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
router.post('/make-payment', payment_controller_1.makePayment);
exports.default = router;
