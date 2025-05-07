import { Router } from 'express';
import { verifyJWT } from "../middleware/auth.middleware";
import * as bookingController from '../controller/booking.controller';

const router: Router = Router();

/**
 * @swagger
 * /api/v1/booking/finalizeCheckIn:
 *   post:
 *     summary: Finalize guest check-in process
 *     tags: [Booking]
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
 *               roomId:
 *                 type: string
 *               checkInTime:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - guestId
 *               - roomId
 *     responses:
 *       200:
 *         description: Check-in finalized successfully
 */
router.route('/finalizeCheckIn').post(bookingController.finalizeCheckIn);

/**
 * @swagger
 * /api/v1/booking/guest/{guestId}:
 *   get:
 *     summary: Get guest's booking history
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: guestId
 *         in: path
 *         required: true
 *         description: ID of the guest
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guest booking history retrieved
 */
router.route('/guest/:guestId').get(bookingController.getGuestBookingHistory);

export default router;
