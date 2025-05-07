"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controller/invoice.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/invoice/create:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoice]
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
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     cost:
 *                       type: number
 *             required:
 *               - guestId
 *               - amount
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
router.post('/create', invoice_controller_1.createInvoice);
exports.default = router;
