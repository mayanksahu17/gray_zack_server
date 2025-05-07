import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import * as roomServiceController from '../controller/roomService.controller';

const router: Router = Router();

/**
 * @swagger
 * /api/v1/room-service/active-bookings/{hotelId}:
 *   get:
 *     summary: Get active bookings for a hotel (used by restaurant POS)
 *     tags: [Room Service]
 *     parameters:
 *       - name: hotelId
 *         in: path
 *         required: true
 *         description: Hotel ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active bookings retrieved
 */
router.get('/active-bookings/:hotelId', roomServiceController.getActiveBookings);

/**
 * @swagger
 * /api/v1/room-service/charge:
 *   post:
 *     summary: Create a new room service charge
 *     tags: [Room Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *               item:
 *                 type: string
 *               amount:
 *                 type: number
 *             required:
 *               - bookingId
 *               - item
 *               - amount
 *     responses:
 *       201:
 *         description: Room service charge created
 */
router.post('/charge', roomServiceController.createRoomServiceCharge);

/**
 * @swagger
 * /api/v1/room-service/charges/{bookingId}:
 *   get:
 *     summary: Get all room service charges for a booking
 *     tags: [Room Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bookingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Charges retrieved
 */
router.get('/charges/:bookingId', verifyJWT, roomServiceController.getRoomServiceCharges);

/**
 * @swagger
 * /api/v1/room-service/charge/{id}:
 *   patch:
 *     summary: Update room service charge status
 *     tags: [Room Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Charge ID
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "paid"
 *     responses:
 *       200:
 *         description: Charge status updated
 */
router.patch('/charge/:id', verifyJWT, roomServiceController.updateRoomServiceStatus);

/**
 * @swagger
 * /api/v1/room-service/pending-charges/{bookingId}:
 *   get:
 *     summary: Get pending room service charges for checkout
 *     tags: [Room Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bookingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pending charges retrieved
 */
router.get('/pending-charges/:bookingId', verifyJWT, roomServiceController.getPendingCharges);

export default router;
