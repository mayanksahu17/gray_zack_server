"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staff_controller_1 = require("../controller/staff.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const router = (0, express_1.Router)();
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
router.post("/login", staff_controller_1.loginStaff);
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
router.post("/refresh-token", staff_controller_1.refreshToken);
// Apply JWT verification for protected routes
router.use(auth_middleware_1.verifyJWT);
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
router.get("/hotel/:hotelId", (0, authorize_middleware_1.authorizeStaff)(['HOTEL_OWNER', 'ADMIN']), staff_controller_1.getStaffByHotel);
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
router.put("/:id", (0, authorize_middleware_1.authorizeStaff)(['HOTEL_OWNER', 'ADMIN']), staff_controller_1.updateStaff);
router.delete("/:id", (0, authorize_middleware_1.authorizeStaff)(['HOTEL_OWNER', 'ADMIN']), staff_controller_1.deleteStaff);
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
router.post("/logout", staff_controller_1.logoutStaff);
exports.default = router;
