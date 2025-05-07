import { Router } from 'express';
import {
  loginStaff,
  getStaffByHotel,
  updateStaff,
  deleteStaff,
  refreshToken,
  logoutStaff
} from '../controller/staff.controller';
import { verifyJWT } from '../middleware/auth.middleware';
import { authorizeStaff } from '../middleware/authorize.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/staff/hotel/login:
 *   post:
 *     summary: Login as staff
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Staff logged in successfully
 */
router.post("/login", loginStaff);

/**
 * @swagger
 * /api/v1/staff/hotel/refresh-token:
 *   post:
 *     summary: Refresh staff JWT token
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: New token generated
 */
router.post("/refresh-token", refreshToken);

// Apply JWT verification for protected routes
router.use(verifyJWT);

/**
 * @swagger
 * /api/v1/staff/hotel/hotel/{hotelId}:
 *   get:
 *     summary: Get all staff members for a hotel
 *     tags: [Staff]
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
 *         description: Staff list retrieved
 */
router.get("/hotel/:hotelId", authorizeStaff(['HOTEL_OWNER', 'ADMIN']), getStaffByHotel);

/**
 * @swagger
 * /api/v1/staff/hotel/{id}:
 *   put:
 *     summary: Update staff details
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Staff updated
 *   delete:
 *     summary: Delete staff
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff deleted
 */
router.put("/:id", authorizeStaff(['HOTEL_OWNER', 'ADMIN']), updateStaff);
router.delete("/:id", authorizeStaff(['HOTEL_OWNER', 'ADMIN']), deleteStaff);

/**
 * @swagger
 * /api/v1/staff/hotel/logout:
 *   post:
 *     summary: Logout staff
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff logged out
 */
router.post("/logout", logoutStaff);

export default router;
