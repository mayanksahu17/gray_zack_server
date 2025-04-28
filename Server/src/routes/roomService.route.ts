import { Router } from 'express'
import { verifyJWT } from '../middleware/auth.middleware'
import * as roomServiceController from '../controller/roomService.controller'

const router: Router = Router()

// Get active bookings for restaurant POS
router.get(
  '/active-bookings/:hotelId',
  // verifyJWT,
  roomServiceController.getActiveBookings
)

// Create room service charge
router.post(
  '/charge',
  // verifyJWT,
  roomServiceController.createRoomServiceCharge
)

// Get room service charges for a booking
router.get(
  '/charges/:bookingId',
  verifyJWT,
  roomServiceController.getRoomServiceCharges
)

// Update room service charge status
router.patch(
  '/charge/:id',
  verifyJWT,
  roomServiceController.updateRoomServiceStatus
)

// Get pending charges for checkout
router.get(
  '/pending-charges/:bookingId',
  verifyJWT,
  roomServiceController.getPendingCharges
)

export default router 