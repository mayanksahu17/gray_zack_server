"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const overview_payment_controller_1 = require("../controller/overview.payment.controller");
const router = (0, express_1.Router)();
router.get('/dashboard/payments-data', overview_payment_controller_1.getPaymentsData);
exports.default = router;
