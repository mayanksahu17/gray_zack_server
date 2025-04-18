import { Router } from 'express';
import { getCheckoutDetails, processCheckout, getCheckoutHistory } from '../controller/checkout.controller';

const router = Router();

// Get checkout details for a guest
router.get('/guest/:userId', getCheckoutDetails);

// Process checkout and payment
router.post('/process', processCheckout);

// Get checkout history for a guest
router.get('/history/:userId', getCheckoutHistory);

export default router; 