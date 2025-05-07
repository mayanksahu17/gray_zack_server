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
const restaurantController = __importStar(require("../controller/restaurant.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const administrator_model_1 = require("../models/administrator.model");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant details by ID
 *     tags: [Restaurant]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Restaurant ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant details retrieved
 */
router.get('/:id', restaurantController.getRestaurantById);
/**
 * @swagger
 * /api/restaurants/{id}/menu:
 *   get:
 *     summary: Get restaurant menu by ID
 *     tags: [Restaurant]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu retrieved successfully
 */
router.get('/:id/menu', restaurantController.getRestaurantMenu);
/**
 * @swagger
 * /api/restaurants/{id}/menu:
 *   post:
 *     summary: Add new menu category
 *     tags: [Restaurant]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Menu category added
 */
router.post('/:id/menu', restaurantController.addMenuCategory);
/**
 * @swagger
 * /api/v1/admin/hotel/restaurant:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 */
router.post('/', auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), restaurantController.createRestaurant);
/**
 * @swagger
 * /api/restaurants/payments/process:
 *   post:
 *     summary: Process restaurant payment
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/payments/process', restaurantController.processPayment);
/**
 * @swagger
 * /api/restaurants/{id}:
 *   patch:
 *     summary: Update restaurant details
 *     tags: [Restaurant]
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
 *         description: Restaurant updated
 */
router.patch('/:id', auth_middleware_1.verifyJWT, (0, authorize_middleware_1.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]), restaurantController.updateRestaurant);
/**
 * @swagger
 * /api/restaurants/{id}/menu-items:
 *   post:
 *     summary: Add new menu item
 *     tags: [Restaurant]
 *     responses:
 *       201:
 *         description: Menu item added
 */
router.post('/:id/menu-items', restaurantController.addMenuItem);
/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu-items/{itemId}:
 *   patch:
 *     summary: Update menu item
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Menu item updated
 */
router.patch('/:restaurantId/menu-items/:itemId', restaurantController.updateMenuItem);
/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu-items/{categoryId}/{itemId}:
 *   delete:
 *     summary: Delete menu item from category
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Menu item deleted
 */
router.delete('/:restaurantId/menu-items/:categoryId/:itemId', restaurantController.deleteMenuItem);
/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu-items/{categoryId}:
 *   delete:
 *     summary: Delete entire menu category
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Menu category deleted
 */
router.delete('/:restaurantId/menu-items/:categoryId', restaurantController.deleteMenuCategory);
/**
 * @swagger
 * /api/restaurants/{id}/tables:
 *   post:
 *     summary: Add table to restaurant
 *     tags: [Restaurant]
 *     responses:
 *       201:
 *         description: Table added
 *   get:
 *     summary: Get all tables for a restaurant
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: List of tables retrieved
 */
router.post("/:id/tables", restaurantController.addRestaurantTable);
router.get("/:id/tables", restaurantController.getRestaurantTables);
/**
 * @swagger
 * /api/restaurants/{id}/tables/{tableId}:
 *   patch:
 *     summary: Update table information
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Table updated
 *   delete:
 *     summary: Delete a table
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Table deleted
 */
router.patch("/:id/tables/:tableId", restaurantController.updateRestaurantTable);
router.delete("/:id/tables/:tableId", restaurantController.deleteRestaurantTable);
/**
 * @swagger
 * /api/restaurants/{id}/tables/{tableId}/status:
 *   patch:
 *     summary: Update table status (e.g., occupied/free)
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Table status updated
 */
router.patch("/:id/tables/:tableId/status", restaurantController.updateTableStatus);
/**
 * @swagger
 * /api/restaurants/{restaurantId}/orders:
 *   post:
 *     summary: Create new order for a restaurant
 *     tags: [Orders]
 *     responses:
 *       201:
 *         description: Order created
 *   get:
 *     summary: Get all orders for a restaurant
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Orders retrieved
 */
router.post('/:restaurantId/orders', restaurantController.createOrder);
router.get('/:restaurantId/orders', restaurantController.getRestaurantOrders);
/**
 * @swagger
 * /api/restaurants/{restaurantId}/orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order details retrieved
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order status updated
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order deleted
 */
router.get('/:restaurantId/orders/:orderId', restaurantController.getOrderById);
router.patch('/:restaurantId/orders/:orderId/status', restaurantController.updateOrderStatus);
router.delete('/:restaurantId/orders/:orderId', restaurantController.deleteOrder);
/**
 * @swagger
 * /api/restaurants/payments/{paymentId}:
 *   get:
 *     summary: Get payment details by payment ID
 *     tags: [Restaurant]
 *     parameters:
 *       - name: paymentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details retrieved
 */
router.get('/payments/:paymentId', restaurantController.getPaymentDetails);
/**
 * @swagger
 * /api/restaurants/{restaurantId}/menu-items/upload-image:
 *   post:
 *     summary: Upload image for menu item
 *     tags: [Restaurant]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post('/:restaurantId/menu-items/upload-image', upload.single('image'), restaurantController.uploadMenuItemImage);
exports.default = router;
