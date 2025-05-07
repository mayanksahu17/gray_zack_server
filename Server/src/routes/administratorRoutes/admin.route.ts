import { Router } from 'express';
import {
    createAdministrator,
    loginAdministrator,
    updateAdministrator,
    deleteAdministrator,
    getAdministrators,
    refreshAccessToken,
    logout
} from '../../controller/posAdminController/administrator.controller';
import { verifyJWT } from '../../middleware/auth.middleware';
import { authorizePermission } from '../../middleware/authorize.middleware';
import { AdminPermission, AdminRole } from '../../models/administrator.model';

const router = Router();

/**
 * @swagger
 * /api/v1.0/admin/login:
 *   post:
 *     summary: Login administrator
 *     tags: [Administrator]
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
 *     responses:
 *       200:
 *         description: Successful login
 */
router.route("/login").post(loginAdministrator);

/**
 * @swagger
 * /api/v1.0/admin/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Administrator]
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.route("/refresh-token").post(refreshAccessToken);

/**
 * @swagger
 * /api/v1.0/admin/logout:
 *   post:
 *     summary: Logout administrator
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.route("/logout").post(verifyJWT, logout);

/**
 * @swagger
 * /api/v1.0/admin/initialize:
 *   post:
 *     summary: Initialize system admin (first-time setup)
 *     tags: [Administrator]
 *     responses:
 *       201:
 *         description: Administrator created
 */
router.route("/initialize").post(createAdministrator);

/**
 * @swagger
 * /api/v1.0/admin/create:
 *   post:
 *     summary: Create new administrator
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Administrator created
 */
router.route("/create").post(
    verifyJWT,
    authorizePermission([AdminRole.SYSTEM_ADMIN]),
    createAdministrator
);

/**
 * @swagger
 * /api/v1.0/admin:
 *   post:
 *     summary: Get all administrators
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of administrators
 */
router.route("/").post(
    verifyJWT,
    authorizePermission([AdminRole.SYSTEM_ADMIN], [AdminPermission.MANAGE_USERS]),
    getAdministrators
);

/**
 * @swagger
 * /api/v1.0/admin/{id}:
 *   put:
 *     summary: Update administrator by ID
 *     tags: [Administrator]
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
 *         description: Administrator updated
 *   delete:
 *     summary: Delete administrator by ID
 *     tags: [Administrator]
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
 *         description: Administrator deleted
 */
router.route("/:id")
    .put(
        verifyJWT,
        authorizePermission([AdminRole.SYSTEM_ADMIN]),
        updateAdministrator
    )
    .delete(
        verifyJWT,
        authorizePermission([AdminRole.SYSTEM_ADMIN]),
        deleteAdministrator
    );

export default router;
