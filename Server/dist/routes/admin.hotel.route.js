"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const administrator_model_1 = require("../models/administrator.model");
const multer_middleware_1 = require("../middleware/multer.middleware");
const hotel_admin_controller_1 = require("../controller/hotel.admin.controller");
const router = (0, express_1.Router)();
// Hotel Profile Management
router.post("/create", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN], [administrator_model_1.AdminPermission.CREATE_HOTEL]), multer_middleware_1.upload.array('hotelImages', 5), hotel_admin_controller_1.createHotel);
router.put("/:hotelId/profile", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), multer_middleware_1.upload.array('hotelImages', 5), hotel_admin_controller_1.updateHotelProfile);
// Staff Management
router.post("/:hotelId/roles", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.createStaffRole);
router.post("/:hotelId/staff", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.manageStaff);
router.get("/:hotelId/staff", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.getAllHotelStaff);
// Analytics and Revenue
router.get("/:hotelId/analytics", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.getHotelAnalytics);
router.get("/:hotelId/revenue", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.getHotelRevenue);
// Get hotel alerts
router.get("/:hotelId/alerts", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN, administrator_model_1.AdminRole.HOTEL_MANAGER]), hotel_admin_controller_1.getHotelAlerts);
// Plan Management
router.post("/:hotelId/upgrade-plan", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.upgradePlan);
router.get("/:hotelId", auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), hotel_admin_controller_1.getHotelDetails);
exports.default = router;
