"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const overview_payment_controller_1 = require("../controller/overview.payment.controller");
const router = (0, express_1.Router)();
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
router.get('/dashboard/payments-data', overview_payment_controller_1.getPaymentsData);
exports.default = router;
