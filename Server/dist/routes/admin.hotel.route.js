"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const administrator_model_1 = require("../models/administrator.model");
const multer_middleware_1 = require("../middleware/multer.middleware");
const hotel_admin_controller_1 = require("../controller/hotel.admin.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/admin/hotels/create:
 *   post:
 *     summary: Create a new hotel
 *     tags: [Hotel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               hotelImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Hotel created
 */
router.post("/create", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN], [administrator_model_1.AdminPermission.CREATE_HOTEL]), multer_middleware_1.upload.array('hotelImages', 5), hotel_admin_controller_1.createHotel);
/**
 * @swagger
 * /api/v1/admin/hotels/{hotelId}/profile:
 *   put:
 *     summary: Update hotel profile
 *     tags: [Hotel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hotelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               hotelImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Hotel profile updated
 */
router.put("/:hotelId/profile", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), multer_middleware_1.upload.array('hotelImages', 5), hotel_admin_controller_1.updateHotelProfile);
/**
 * @swagger
 * /api/v1/admin/hotels/{hotelId}/roles:
 *   post:
 *     summary: Create staff roles
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hotelId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Staff role created
 */
router.post("/:hotelId/roles", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.createStaffRole);
/**
 * @swagger
 * /api/v1/admin/hotels/{hotelId}/staff:
 *   post:
 *     summary: Add or update hotel staff
 *     tags: [Staff]
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
 *         description: Staff updated
 *   get:
 *     summary: Get all hotel staff
 *     tags: [Staff]
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
 *         description: List of hotel staff
 */
router.post("/:hotelId/staff", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.manageStaff);
router.get("/:hotelId/staff", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.getAllHotelStaff);
/**
 * @swagger
 * /api/v1/admin/hotels/{hotelId}/analytics:
 *   get:
 *     summary: Get hotel analytics
 *     tags: [Analytics]
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
 *         description: Analytics data
 */
router.get("/:hotelId/analytics", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.getHotelAnalytics);
/**
 * @swagger
 * /api/v1/admin/hotels/{hotelId}/revenue:
 *   get:
 *     summary: Get hotel revenue data
 *     tags: [Analytics]
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
 *         description: Revenue data
 */
router.get("/:hotelId/revenue", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.getHotelRevenue);
/**
 * @swagger
 * /api/v1/admin/hotels/{hotelId}/alerts:
 *   get:
 *     summary: Get hotel alerts
 *     tags: [Hotel]
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
 *         description: List of alerts
 */
router.get("/:hotelId/alerts", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN, administrator_model_1.AdminRole.HOTEL_MANAGER]), hotel_admin_controller_1.getHotelAlerts);
/**
 * @swagger
 * /api/v1/admin/hotels/{hotelId}/upgrade-plan:
 *   post:
 *     summary: Upgrade hotel subscription plan
 *     tags: [Hotel]
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
 *         description: Plan upgraded
 */
router.post("/:hotelId/upgrade-plan", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.upgradePlan);
/**
 * @swagger
 * /api/v1/admin/hotels/{hotelId}:
 *   get:
 *     summary: Get hotel details
 *     tags: [Hotel]
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
 *         description: Hotel details
 */
router.get("/:hotelId", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.getHotelDetails);
exports.default = router;
