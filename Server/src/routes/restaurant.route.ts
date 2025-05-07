import express from 'express';
import * as restaurantController from '../controller/restaurant.controller';
import { verifyJWT } from '../middleware/auth.middleware';
import { authorizePermission } from '../middleware/authorize.middleware';
import { AdminRole } from '../models/administrator.model';
import multer from 'multer';

const router = express.Router();
const upload = multer();

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
router.post(
  '/',
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.createRestaurant
);

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
router.patch(
  '/:id',
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.updateRestaurant
);

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

export default router;
