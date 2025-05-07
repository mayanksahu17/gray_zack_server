import { Router } from 'express'
import { verifyJWT } from "../middleware/auth.middleware";
import { authorizePermission } from "../middleware/authorize.middleware";
import { AdminRole, AdminPermission } from '../models/administrator.model';
import { upload } from "../middleware/multer.middleware";
import {
  createHotel,
  updateHotelProfile,
  getHotelAnalytics,
  getHotelRevenue,
  createStaffRole,
  manageStaff,
  upgradePlan,
  getHotelDetails,
  getAllHotelStaff,
  getHotelAlerts
} from '../controller/hotel.admin.controller';

const router: Router = Router();

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
router.post(
  "/create",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN], [AdminPermission.CREATE_HOTEL]),
  upload.array('hotelImages', 5),
  createHotel
);

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
router.put(
  "/:hotelId/profile",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  upload.array('hotelImages', 5),
  updateHotelProfile
);

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
router.post(
  "/:hotelId/roles",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  createStaffRole
);

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
router.post(
  "/:hotelId/staff",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  manageStaff
);

router.get(
  "/:hotelId/staff",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  getAllHotelStaff
);

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
router.get(
  "/:hotelId/analytics",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  getHotelAnalytics
);

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
router.get(
  "/:hotelId/revenue",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  getHotelRevenue
);

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
router.get(
  "/:hotelId/alerts",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN, AdminRole.HOTEL_MANAGER]),
  getHotelAlerts
);

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
router.post(
  "/:hotelId/upgrade-plan",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  upgradePlan
);

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
router.get(
  "/:hotelId",
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  getHotelDetails
);

export default router;
