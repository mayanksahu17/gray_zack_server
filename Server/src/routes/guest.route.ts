import { Router } from 'express';
import { verifyJWT } from "../middleware/auth.middleware";
import * as guestController from '../controller/guest.controller';

const router: Router = Router();

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

export default router;
