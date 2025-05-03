"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const administrator_controller_1 = require("../../controller/posAdminController/administrator.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const authorize_middleware_1 = require("../../middleware/authorize.middleware");
const administrator_model_1 = require("../../models/administrator.model");
const router = (0, express_1.Router)();
// Public route
router.route("/login").post(administrator_controller_1.loginAdministrator);
router.route("/refresh-token").post(administrator_controller_1.refreshAccessToken);
router.route("/logout").post(auth_middleware_1.verifyJWT, administrator_controller_1.logout);
// Protected routes
// Only system admins can create new administrators
router.route("/initialize")
    .post(administrator_controller_1.createAdministrator);
router.route("/create")
    .post(auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.SYSTEM_ADMIN]), administrator_controller_1.createAdministrator);
// Get all administrators (requires manage_users permission)
router.route("/")
    .post(auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.SYSTEM_ADMIN], [administrator_model_1.AdminPermission.MANAGE_USERS]), administrator_controller_1.getAdministrators);
// Update and delete routes (requires system_admin role)
router.route("/:id")
    .put(auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.SYSTEM_ADMIN]), administrator_controller_1.updateAdministrator)
    .delete(auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.SYSTEM_ADMIN]), administrator_controller_1.deleteAdministrator);
exports.default = router;
