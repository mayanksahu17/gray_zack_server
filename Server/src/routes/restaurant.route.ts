import express from 'express';
import * as restaurantController from '../controller/restaurant.controller'; // Adjust import path as needed
import { verifyJWT } from '../middleware/auth.middleware';
import { authorizePermission } from '../middleware/authorize.middleware';
import { AdminRole } from '../models/administrator.model';
// import { Restaurant } from '../models/restaurant.model';
import { StaffRole } from '../models/staff.model';



const router = express.Router();

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/availability', restaurantController.checkRestaurantAvailability);
router.get('/:id/menu', restaurantController.getRestaurantMenu);

// Protected routes - Hotel Admin only
router.post(
  '/',
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.createRestaurant
);

router.patch(
  '/:id',
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.updateRestaurant
);

router.delete(
  '/:id',
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.deleteRestaurant
);

// Menu Customization Routes
router.post(
  '/:id/menu-items',
  verifyJWT,
  // authorizePermission([AdminRole.HOTEL_ADMIN]),
  // authorizePermission([StaffRole.RESTAURANT_MANAGER]),
  restaurantController.addMenuItem
);

router.patch(
  '/:id/menu-items/:itemId',
  verifyJWT,
  // authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.updateMenuItem
);

// Table Management Routes
router.post(
  '/:id/tables',
  verifyJWT,
  // authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.addTable
);

// Room Service Routes
router.post(
  '/:id/room-service',
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.createRoomServiceOrder
);

// Mobile Ordering Routes
router.get(
  '/:id/qr-code',
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.generateQRCode
);

router.post(
  '/:id/mobile-orders',
  verifyJWT,
  authorizePermission([AdminRole.HOTEL_ADMIN]),
  restaurantController.createMobileOrder
);

export default router;