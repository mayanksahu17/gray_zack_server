"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationController = __importStar(require("../controller/reservation.controller"));
const router = (0, express_1.Router)();
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
exports.default = router;
