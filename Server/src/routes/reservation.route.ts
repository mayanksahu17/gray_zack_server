import { Router } from 'express';
import { verifyJWT } from "../middleware/auth.middleware";
import * as reservationController from '../controller/reservation.controller';

const router: Router = Router();

/**
 * @swagger
 * /api/v1/reservation/create:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservation]
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
 *               hotelId:
 *                 type: string
 *               roomType:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *             required:
 *               - guestId
 *               - hotelId
 *               - roomType
 *               - checkInDate
 *               - checkOutDate
 *     responses:
 *       201:
 *         description: Reservation created successfully
 */
router.post('/create', reservationController.createBooking);

/**
 * @swagger
 * /api/v1/reservation/{id}:
 *   get:
 *     summary: Get reservations for a guest
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Guest ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reservations
 *   patch:
 *     summary: Update a reservation by ID
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Reservation ID
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Reservation updated
 *   delete:
 *     summary: Delete a reservation by ID
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Reservation ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation deleted
 */
router
  .get('/:id', reservationController.getBookingsByGuest)
  .patch('/:id', reservationController.updateBooking)
  .delete('/:id', reservationController.deleteBooking);

/**
 * @swagger
 * /api/v1/reservation/checkInGuest:
 *   post:
 *     summary: Check-in a guest into a reservation
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reservationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Guest checked in successfully
 */
router.post('/checkInGuest', reservationController.checkInGuest);

/**
 * @swagger
 * /api/v1/reservation/getAvailableRooms:
 *   get:
 *     summary: Get currently available rooms across hotels
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available rooms
 */
router.get('/getAvailableRooms', reservationController.getAvailableRooms);

/**
 * @swagger
 * /api/v1/reservation/hotel/{hotelId}/available-rooms:
 *   get:
 *     summary: Get available rooms for a specific hotel
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hotelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of available rooms for the hotel
 */
router.get('/hotel/:hotelId/available-rooms', reservationController.getAvailableRooms);

/**
 * @swagger
 * /api/v1/reservation/hotel/{hotelId}/daily:
 *   get:
 *     summary: Get daily bookings for a specific hotel
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hotelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily bookings retrieved
 */
router.get('/hotel/:hotelId/daily', reservationController.getDailyBookings);

export default router;
