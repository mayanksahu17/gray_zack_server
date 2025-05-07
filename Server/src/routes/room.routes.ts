import { Router } from 'express';
import { verifyJWT } from "../middleware/auth.middleware";
import { 
  createRoom, 
  getRooms, 
  getRoomById,
  updateRoom, 
  deleteRoom,
  updateRoomStatus,
  markRoomAsCleaned,
  seedHotelRooms
} from '../controller/room.controller';

const router: Router = Router();

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
router.route('/seed-room').post(seedHotelRooms);

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
  .get(getRooms)
  .post(createRoom);

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
  .get(getRoomById)
  .patch(updateRoom)
  .delete(deleteRoom);

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
  .patch(updateRoomStatus);

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
  .patch(markRoomAsCleaned);

export default router;
