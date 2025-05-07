"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const administrator_controller_1 = require("../../controller/posAdminController/administrator.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const authorize_middleware_1 = require("../../middleware/authorize.middleware");
const administrator_model_1 = require("../../models/administrator.model");
const router = (0, express_1.Router)();
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
router.route("/login").post(administrator_controller_1.loginAdministrator);
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
router.route("/refresh-token").post(administrator_controller_1.refreshAccessToken);
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
router.route("/logout").post(auth_middleware_1.verifyJWT, administrator_controller_1.logout);
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
router.route("/initialize").post(administrator_controller_1.createAdministrator);
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
router.route("/create").post(auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.SYSTEM_ADMIN]), administrator_controller_1.createAdministrator);
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
router.route("/").post(auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.SYSTEM_ADMIN], [administrator_model_1.AdminPermission.MANAGE_USERS]), administrator_controller_1.getAdministrators);
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
    .put(auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.SYSTEM_ADMIN]), administrator_controller_1.updateAdministrator)
    .delete(auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.SYSTEM_ADMIN]), administrator_controller_1.deleteAdministrator);
exports.default = router;
