import { Router } from 'express';
import { verifyJWT } from "../middleware/auth.middleware";
import { createInvoice } from '../controller/invoice.controller';

const router: Router = Router();

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
router.post('/create', createInvoice);

export default router;
