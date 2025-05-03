"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staff_controller_1 = require("../controller/staff.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post("/login", staff_controller_1.loginStaff);
router.post("/refresh-token", staff_controller_1.refreshToken);
// Protected routes
router.use(auth_middleware_1.verifyJWT); // Apply JWT verification to all routes below
router.get("/hotel/:hotelId", (0, authorize_middleware_1.authorizeStaff)(['HOTEL_OWNER', 'ADMIN']), staff_controller_1.getStaffByHotel);
router.put("/:id", (0, authorize_middleware_1.authorizeStaff)(['HOTEL_OWNER', 'ADMIN']), staff_controller_1.updateStaff);
router.delete("/:id", (0, authorize_middleware_1.authorizeStaff)(['HOTEL_OWNER', 'ADMIN']), staff_controller_1.deleteStaff);
router.post("/logout", staff_controller_1.logoutStaff);
exports.default = router;
