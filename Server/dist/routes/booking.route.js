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
const bookingController = __importStar(require("../controller/booking.controller"));
const router = (0, express_1.Router)();
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
exports.default = router;
