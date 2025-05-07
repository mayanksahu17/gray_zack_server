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
const guestController = __importStar(require("../controller/guest.controller"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/guest:
 *   post:
 *     summary: Create a new guest
 *     tags: [Guest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *             required:
 *               - name
 *               - phone
 *     responses:
 *       201:
 *         description: Guest created successfully
 */
router.post('/', guestController.createGuest);
/**
 * @swagger
 * /api/v1/guest/search:
 *   get:
 *     summary: Search guests by name, email, or phone
 *     tags: [Guest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: query
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of matching guests
 */
router.get('/search', guestController.searchGuests);
/**
 * @swagger
 * /api/v1/guest/{id}:
 *   get:
 *     summary: Get guest details by ID
 *     tags: [Guest]
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
 *         description: Guest details retrieved
 */
router.get('/:id', guestController.getGuestById);
/**
 * @swagger
 * /api/v1/guest/hotel/{hotelId}:
 *   get:
 *     summary: Get all guests for a hotel
 *     tags: [Guest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hotelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: List of guests for the hotel
 */
router.get('/hotel/:hotelId', guestController.getGuestsByHotel);
/**
 * @swagger
 * /api/v1/guest/{id}:
 *   put:
 *     summary: Update guest details by ID
 *     tags: [Guest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Guest ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Guest updated successfully
 */
router.put('/:id', guestController.updateGuest);
/**
 * @swagger
 * /api/v1/guest/{id}:
 *   delete:
 *     summary: Delete guest by ID
 *     tags: [Guest]
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
 *         description: Guest deleted successfully
 */
router.delete('/:id', guestController.deleteGuest);
exports.default = router;
