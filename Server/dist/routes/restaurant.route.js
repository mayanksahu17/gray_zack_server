"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const restaurantController = __importStar(require("../controller/restaurant.controller")); // Adjust import path as needed
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const administrator_model_1 = require("../models/administrator.model");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
// Public routes
// router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
// router.get('/:id/availability', restaurantController.checkRestaurantAvailability);
router.get('/:id/menu', restaurantController.getRestaurantMenu);
router.post('/:id/menu', restaurantController.addMenuCategory);
// Protected routes - Hotel Admin only
router.post('/', auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), restaurantController.createRestaurant);
router.post('/payments/process', 
// verifyJWT,
restaurantController.processPayment);
router.patch('/:id', auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), restaurantController.updateRestaurant);
// router.delete(
//   '/:id',
//   verifyJWT,
//   authorizePermission([AdminRole.HOTEL_ADMIN]),
//   restaurantController.deleteRestaurant
// );
// Menu Customization Routes
router.post('/:id/menu-items', auth_middleware_1.verifyJWT, 
// authorizePermission([AdminRole.HOTEL_ADMIN]),
// authorizePermission([StaffRole.RESTAURANT_MANAGER]),
restaurantController.addMenuItem);
router.patch('/:restaurantId/menu-items/:itemId', 
// verifyJWT,
// authorizePermission([AdminRole.HOTEL_ADMIN]),
restaurantController.updateMenuItem);
router.delete('/:restaurantId/menu-items/:categoryId/:itemId', 
// verifyJWT,
// authorizePermission([AdminRole.HOTEL_ADMIN]),
restaurantController.deleteMenuItem);
router.delete('/:restaurantId/menu-items/:categoryId', restaurantController.deleteMenuCategory);
// Table Management Routes
router.post("/:id/tables", restaurantController.addRestaurantTable);
router.get("/:id/tables", restaurantController.getRestaurantTables);
router.patch("/:id/tables/:tableId", restaurantController.updateRestaurantTable);
router.delete("/:id/tables/:tableId", restaurantController.deleteRestaurantTable);
router.patch("/:id/tables/:tableId/status", restaurantController.updateTableStatus);
// Room Service Routes
// router.post(
//   '/:id/room-service',
//   verifyJWT,
//   authorizePermission([AdminRole.HOTEL_ADMIN]),
//   restaurantController.createRoomServiceOrder
// );
// Mobile Ordering Routes
// router.get(
//   '/:id/qr-code',
//   verifyJWT,
//   authorizePermission([AdminRole.HOTEL_ADMIN]),
//   restaurantController.generateQRCode
// );
// router.post(
//   '/:id/mobile-orders',
//   verifyJWT,
//   authorizePermission([AdminRole.HOTEL_ADMIN]),
//   restaurantController.createMobileOrder
// );
// Order Routes
router.post('/:restaurantId/orders', 
// verifyJWT,
restaurantController.createOrder);
router.get('/:restaurantId/orders', 
// verifyJWT,
restaurantController.getRestaurantOrders);
router.get('/:restaurantId/orders/:orderId', 
// verifyJWT,
restaurantController.getOrderById);
router.patch('/:restaurantId/orders/:orderId/status', 
// verifyJWT,
restaurantController.updateOrderStatus);
router.delete('/:restaurantId/orders/:orderId', 
// verifyJWT,
restaurantController.deleteOrder);
// Payment Routes
router.post('/payments/process', 
// verifyJWT,
restaurantController.processPayment);
router.get('/payments/:paymentId', 
// verifyJWT,
restaurantController.getPaymentDetails);
// Image upload route
router.post('/:restaurantId/menu-items/upload-image', upload.single('image'), restaurantController.uploadMenuItemImage);
exports.default = router;
