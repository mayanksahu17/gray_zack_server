"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkout_controller_1 = require("../controller/checkout.controller");
const router = (0, express_1.Router)();
// Get checkout details for a guest
router.get('/guest/:userId', checkout_controller_1.getCheckoutDetails);
// Process checkout and payment
router.post('/process', checkout_controller_1.processCheckout);
// Get checkout history for a guest
router.get('/history/:userId', checkout_controller_1.getCheckoutHistory);
exports.default = router;
