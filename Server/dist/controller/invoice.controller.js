"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoice = void 0;
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const createInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId, guestId, roomId, lineItems, subtotal, taxAmount, totalAmount, billing } = req.body;
        // Validate essential fields
        if (!bookingId || !guestId || !roomId || !lineItems || !billing) {
            res.status(400).json({ error: 'Missing required invoice fields' });
            return;
        }
        const invoiceData = {
            bookingId,
            guestId,
            roomId,
            lineItems,
            subtotal,
            taxAmount,
            totalAmount,
            billing,
            issuedAt: new Date().toISOString()
        };
        const invoice = yield invoice_model_1.default.create(invoiceData);
        res.status(201).json({
            message: 'Invoice created successfully',
            invoice
        });
    }
    catch (err) {
        console.error('Error creating invoice:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
exports.createInvoice = createInvoice;
