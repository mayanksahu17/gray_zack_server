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
exports.getCheckoutHistory = exports.processCheckout = exports.getCheckoutDetails = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const guest_model_1 = __importDefault(require("../models/guest.model"));
const room_model_1 = __importDefault(require("../models/room.model"));
const RoomService_model_1 = __importDefault(require("../models/RoomService.model"));
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const booking_model_1 = __importStar(require("../models/booking.model"));
const axios_1 = __importDefault(require("axios"));
// Environment check to use simulation in development
const DEV_MODE = true; // Force development mode for now
const SIMULATE_PAYMENTS = true; // Always simulate payments until PaidYET integration is working
// PaidYET API Configuration (These should be in environment variables in production)
const PAIDYET_CONFIG = {
    uuid: 'CF9C02BF-9EBA-3707-98B4-14EB73A3E6EA',
    key: 'uSWmLADv5IQsMiRcIFGYJCBT1N7G1Mw2a1UuSAuv',
    pin: '8766',
    baseUrl: 'https://api.sandbox-paidyet.com/v3'
};
/**
 * Get checkout details for a guest by userId
 * This endpoint retrieves all required data for checkout including:
 * - Guest information
 * - Room information
 * - Room services used
 * - Payment status
 */
const getCheckoutDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: 'Invalid user ID format' });
            return;
        }
        // Find the guest
        const guest = yield guest_model_1.default.findById(userId);
        if (!guest) {
            res.status(404).json({ error: 'Guest not found' });
            return;
        }
        // Find active booking for this guest
        const booking = yield booking_model_1.default.findOne({
            guestId: userId,
            status: booking_model_1.BookingStatus.CHECKED_IN
        }).populate('roomId');
        if (!booking) {
            res.status(404).json({ error: 'No active booking found for this guest' });
            return;
        }
        // Get room service charges
        const roomServices = yield RoomService_model_1.default.find({
            bookingId: booking._id,
            addedToInvoice: false
        }).populate('orderId');
        // Calculate totals
        const roomServiceTotal = roomServices.reduce((sum, service) => sum + service.amount, 0);
        // Calculate room charges
        const checkInDate = new Date(booking.checkIn);
        const today = new Date();
        const nightsStayed = Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const roomRate = booking.roomId ? booking.roomId.pricePerNight : 0;
        const roomChargeTotal = roomRate * nightsStayed;
        // Get add-on charges
        const addOnTotal = booking.addOns.reduce((sum, addon) => sum + addon.cost, 0);
        // Calculate grand total
        const subtotal = roomChargeTotal + roomServiceTotal + addOnTotal;
        const taxRate = 0.10; // 10% tax rate
        const taxAmount = subtotal * taxRate;
        const grandTotal = subtotal + taxAmount;
        res.status(200).json({
            success: true,
            data: {
                guest,
                booking,
                room: booking.roomId,
                roomServices,
                summary: {
                    nightsStayed,
                    roomRate,
                    roomChargeTotal,
                    roomServiceTotal,
                    addOnTotal,
                    subtotal,
                    taxAmount,
                    grandTotal,
                    alreadyPaid: booking.payment.paidAmount,
                    remainingBalance: grandTotal - booking.payment.paidAmount
                }
            }
        });
    }
    catch (err) {
        console.error('Error fetching checkout details:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
exports.getCheckoutDetails = getCheckoutDetails;
// Process payment with PaidYET
const processPaidYETPayment = (amount, cardDetails, description) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // Simulate successful payment in development
        if (SIMULATE_PAYMENTS) {
            console.log('DEVELOPMENT MODE: Simulating successful payment');
            console.log('Payment amount:', amount);
            console.log('Payment description:', description);
            console.log('Card details (masked):', {
                number: `xxxx-xxxx-xxxx-${cardDetails.number.slice(-4)}`,
                expMonth: cardDetails.expMonth,
                expYear: cardDetails.expYear,
                cvv: '***',
                zipCode: cardDetails.zipCode
            });
            return {
                success: true,
                transactionId: `sim_${Date.now()}`,
                message: 'Payment processed successfully (SIMULATED)'
            };
        }
        // Add more logging to debug authentication
        console.log('Processing payment with PaidYET. Amount:', amount);
        // PaidYET might expect headers for authentication instead of body params
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': PAIDYET_CONFIG.key,
            'x-api-uuid': PAIDYET_CONFIG.uuid
        };
        // Structure the payload according to PaidYET docs
        const payload = {
            pin: PAIDYET_CONFIG.pin,
            amount: Number(amount.toFixed(2)),
            card: {
                number: cardDetails.number,
                exp_month: cardDetails.expMonth,
                exp_year: cardDetails.expYear,
                cvv: cardDetails.cvv,
                zip: cardDetails.zipCode
            },
            description: description
        };
        console.log('PaidYET request details (sanitized):');
        console.log('URL:', `${PAIDYET_CONFIG.baseUrl}/transaction`);
        console.log('Headers:', Object.assign(Object.assign({}, headers), { 'x-api-key': '[REDACTED]', 'x-api-uuid': '[REDACTED]' }));
        console.log('Payload:', Object.assign(Object.assign({}, payload), { pin: '[REDACTED]', card: Object.assign(Object.assign({}, payload.card), { number: '[REDACTED]', cvv: '[REDACTED]' }) }));
        const response = yield axios_1.default.post(`${PAIDYET_CONFIG.baseUrl}/transaction`, payload, { headers });
        console.log('PaidYET response:', JSON.stringify(response.data));
        if (response.data.status === 'success') {
            return {
                success: true,
                transactionId: response.data.transactionId || response.data.id || `txn_${Date.now()}`,
                message: 'Payment processed successfully'
            };
        }
        else {
            throw new Error(response.data.message || 'Payment processing failed');
        }
    }
    catch (error) {
        // If in development mode with simulation enabled, don't propagate errors
        if (SIMULATE_PAYMENTS) {
            console.warn('Payment simulation: Would have failed with real provider');
            console.warn('Error details:', error.message);
            return {
                success: true,
                transactionId: `sim_err_${Date.now()}`,
                message: 'Payment processed successfully (SIMULATED RECOVERY)'
            };
        }
        // Enhanced error logging
        console.error('PaidYET payment error:');
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        }
        else if (error.request) {
            // The request was made but no response was received
            console.error('Request made but no response received:', error.request);
        }
        else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
            ((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) ||
            error.message ||
            'Payment processing failed');
    }
});
/**
 * Process checkout payment and complete the checkout process
 */
const processCheckout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { userId, bookingId, paymentMethod, paymentDetails, roomServices } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId) || !mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
            res.status(400).json({ error: 'Invalid ID format' });
            return;
        }
        // Find the booking
        const booking = yield booking_model_1.default.findOne({
            _id: bookingId,
            guestId: userId,
            status: booking_model_1.BookingStatus.CHECKED_IN
        }).populate('roomId').session(session);
        if (!booking) {
            yield session.abortTransaction();
            session.endSession();
            res.status(404).json({ error: 'Active booking not found' });
            return;
        }
        const room = booking.roomId;
        // Calculate checkout totals
        const checkInDate = new Date(booking.checkIn);
        const today = new Date();
        const nightsStayed = Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const roomRate = room.pricePerNight;
        const roomChargeTotal = roomRate * nightsStayed;
        // Get room service charges that need to be added to invoice
        const roomServiceIds = roomServices.map((id) => id);
        const roomServiceItems = yield RoomService_model_1.default.find({
            _id: { $in: roomServiceIds },
            bookingId: bookingId,
            addedToInvoice: false
        }).session(session);
        const roomServiceTotal = roomServiceItems.reduce((sum, service) => sum + service.amount, 0);
        // Add-on charges
        const addOnTotal = booking.addOns.reduce((sum, addon) => sum + addon.cost, 0);
        // Calculate totals for invoice
        const subtotal = roomChargeTotal + roomServiceTotal + addOnTotal;
        const taxRate = 0.10; // 10% tax rate
        const taxAmount = subtotal * taxRate;
        const grandTotal = subtotal + taxAmount;
        const balanceDue = grandTotal - booking.payment.paidAmount;
        // Prepare invoice line items
        // Use specific string literals that match the enum in the model
        const lineItems = [
            {
                type: 'room_charge',
                description: `Room charges for ${nightsStayed} nights at $${roomRate}/night`,
                amount: roomChargeTotal
            },
            {
                type: 'tax',
                description: `Tax (10%)`,
                amount: taxAmount
            }
        ];
        // Add room service items
        for (const service of roomServiceItems) {
            lineItems.push({
                type: 'room_service',
                description: `Room service: ${service._id}`,
                amount: service.amount
            });
        }
        // Add add-ons if any
        if (booking.addOns.length > 0) {
            for (const addon of booking.addOns) {
                lineItems.push({
                    type: 'add_on',
                    description: `Add-on: ${addon.name}`,
                    amount: addon.cost
                });
            }
        }
        // Process payment
        let paymentStatus = 'unpaid';
        let paidAmount = booking.payment.paidAmount;
        let transactionId = undefined;
        let paymentError = null;
        try {
            // Process payment based on method
            if (paymentMethod === 'credit_card') {
                if (!paymentDetails || !paymentDetails.card) {
                    throw new Error('Card details are required for credit card payment');
                }
                // Process payment with PaidYET
                const paymentResult = yield processPaidYETPayment(balanceDue, paymentDetails.card, `Hotel checkout for booking ${bookingId}`);
                if (paymentResult.success) {
                    transactionId = paymentResult.transactionId;
                    paymentStatus = 'paid';
                    paidAmount += balanceDue;
                }
                else {
                    throw new Error(paymentResult.message || 'Payment processing failed');
                }
            }
            else if (paymentMethod === 'cash') {
                // Cash payment is processed manually
                paymentStatus = 'paid';
                paidAmount += balanceDue;
                transactionId = `CASH${Date.now()}`;
            }
            else {
                throw new Error('Unsupported payment method');
            }
        }
        catch (error) {
            paymentError = error.message;
            console.error('Payment processing error:', error);
            // Don't throw here, we'll handle the error after transaction abort
        }
        // If payment failed, abort transaction and return error
        if (paymentError) {
            yield session.abortTransaction();
            session.endSession();
            res.status(400).json({
                success: false,
                error: paymentError || 'Payment processing failed'
            });
            return;
        }
        // Create invoice
        const invoice = yield invoice_model_1.default.create([{
                bookingId: booking._id,
                guestId: userId,
                roomId: room._id,
                lineItems,
                subtotal,
                taxAmount,
                totalAmount: grandTotal,
                billing: {
                    method: paymentMethod === 'credit_card' ? 'credit_card' : 'cash',
                    paidAmount,
                    status: paymentStatus,
                    transactionId,
                    paidAt: new Date()
                }
            }], { session });
        // Update room service items to mark them as added to invoice
        yield RoomService_model_1.default.updateMany({ _id: { $in: roomServiceIds } }, { addedToInvoice: true, status: 'charged' }, { session });
        // Update booking status
        yield booking_model_1.default.findByIdAndUpdate(bookingId, {
            status: booking_model_1.BookingStatus.CHECKED_OUT,
            actualCheckOut: new Date(),
            payment: Object.assign(Object.assign({}, booking.payment), { status: paymentStatus, paidAmount, transactionId: transactionId || booking.payment.transactionId })
        }, { session });
        // Update room status
        yield room_model_1.default.findByIdAndUpdate(room._id, {
            status: 'cleaning',
            lastCleaned: null // Will require cleaning
        }, { session });
        // Update room revenue data
        const roomDoc = yield room_model_1.default.findById(room._id).session(session);
        if (roomDoc) {
            roomDoc.addDailyRevenue(new Date(), roomChargeTotal, roomServiceTotal + addOnTotal, nightsStayed);
            yield roomDoc.save({ session });
        }
        // Commit the transaction
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            message: 'Checkout completed successfully',
            data: {
                invoice: invoice[0],
                paymentStatus,
                checkoutDate: new Date(),
                nightsStayed,
                roomRevenue: roomChargeTotal,
                additionalRevenue: roomServiceTotal + addOnTotal,
                totalRevenue: grandTotal
            }
        });
    }
    catch (err) {
        yield session.abortTransaction();
        session.endSession();
        console.error('Error processing checkout:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
exports.processCheckout = processCheckout;
/**
 * Get checkout history for a guest
 */
const getCheckoutHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: 'Invalid user ID format' });
            return;
        }
        // Find previous bookings for this guest that have been checked out
        const bookings = yield booking_model_1.default.find({
            guestId: userId,
            status: booking_model_1.BookingStatus.CHECKED_OUT
        })
            .populate('roomId')
            .sort({ actualCheckOut: -1 });
        // Get associated invoices
        const invoices = yield invoice_model_1.default.find({
            guestId: userId
        }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: {
                bookings,
                invoices
            }
        });
    }
    catch (err) {
        console.error('Error fetching checkout history:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});
exports.getCheckoutHistory = getCheckoutHistory;
