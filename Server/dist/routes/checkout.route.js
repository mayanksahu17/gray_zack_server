"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkout_controller_1 = require("../controller/checkout.controller");
const router = (0, express_1.Router)();
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
router.get('/guest/:userId', checkout_controller_1.getCheckoutDetails);
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
router.post('/process', checkout_controller_1.processCheckout);
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
router.get('/history/:userId', checkout_controller_1.getCheckoutHistory);
exports.default = router;
