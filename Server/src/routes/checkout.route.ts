import express from 'express';
import { 
  getCheckoutDetails, 
  processCheckout, 
  getCheckoutHistory,
  getCheckoutDetailsByBooking 
} from '../controller/checkout.controller';

const router = express.Router();

// Get checkout details for a guest
router.get('/guest/:userId', getCheckoutDetails);

// Process checkout and payment
router.post('/process', processCheckout);

// Get checkout history for a guest
router.get('/history/:userId', getCheckoutHistory);

// Get checkout details by booking ID
router.get('/details/booking/:bookingId', getCheckoutDetailsByBooking);

export default router;