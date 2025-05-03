"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controller/invoice.controller");
const router = (0, express_1.Router)();
router.post('/create', invoice_controller_1.createInvoice);
exports.default = router;
