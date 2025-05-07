"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controller/room.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/room/seed-room:
 *   post:
 *     summary: Seed hotel rooms with sample data
 *     tags: [Room]
 *     responses:
 *       201:
 *         description: Rooms seeded successfully
 */
router.route('/seed-room').post(room_controller_1.seedHotelRooms);
/**
 * @swagger
 * /api/v1/room:
 *   get:
 *     summary: Get all rooms
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: List of rooms retrieved
 *   post:
 *     summary: Create a new room
 *     tags: [Room]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hotelId:
 *                 type: string
 *               roomNumber:
 *                 type: string
 *               roomType:
 *                 type: string
 *             required:
 *               - hotelId
 *               - roomNumber
 *               - roomType
 *     responses:
 *       201:
 *         description: Room created successfully
 */
router.route('/')
    .get(room_controller_1.getRooms)
    .post(room_controller_1.createRoom);
/**
 * @swagger
 * /api/v1/room/{id}:
 *   get:
 *     summary: Get room by ID
 *     tags: [Room]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room details retrieved
 *   patch:
 *     summary: Update room details
 *     tags: [Room]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Room updated
 *   delete:
 *     summary: Delete room
 *     tags: [Room]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room deleted
 */
router.route('/:id')
    .get(room_controller_1.getRoomById)
    .patch(room_controller_1.updateRoom)
    .delete(room_controller_1.deleteRoom);
/**
 * @swagger
 * /api/v1/room/{id}/status:
 *   patch:
 *     summary: Update room status (e.g., available, occupied)
 *     tags: [Room]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
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
 *                 example: "available"
 *     responses:
 *       200:
 *         description: Room status updated
 */
router.route('/:id/status')
    .patch(room_controller_1.updateRoomStatus);
/**
 * @swagger
 * /api/v1/room/{id}/clean:
 *   patch:
 *     summary: Mark room as cleaned
 *     tags: [Room]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room marked as cleaned
 */
router.route('/:id/clean')
    .patch(room_controller_1.markRoomAsCleaned);
exports.default = router;
