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
const auth_middleware_1 = require("../middleware/auth.middleware");
const roomServiceController = __importStar(require("../controller/roomService.controller"));
const router = (0, express_1.Router)();
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
router.get('/charges/:bookingId', auth_middleware_1.verifyJWT, roomServiceController.getRoomServiceCharges);
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
router.patch('/charge/:id', auth_middleware_1.verifyJWT, roomServiceController.updateRoomServiceStatus);
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
router.get('/pending-charges/:bookingId', auth_middleware_1.verifyJWT, roomServiceController.getPendingCharges);
exports.default = router;
