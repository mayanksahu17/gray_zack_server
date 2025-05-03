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
exports.makePayment = void 0;
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
// Process payment with PaidYET
const processPaidYETPayment = (amount, cardDetails, description) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        // PaidYET API headers
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
        const response = yield axios_1.default.post(`${PAIDYET_CONFIG.baseUrl}/transaction`, payload, { headers });
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
        console.error('PaidYET payment error:', error.message);
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message || 'Payment processing failed');
    }
});
const makePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardNumber, expiry, cvv, amount, currency, userId, zipCode } = req.body;
        // Simple validation
        if (!cardNumber || !expiry || !cvv || !amount || !currency) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        // Format card data for PaidYET
        const cardDetails = {
            number: cardNumber.replace(/\s/g, ''),
            expMonth: expiry.split('/')[0],
            expYear: expiry.includes('/') ?
                `20${expiry.split('/')[1]}` :
                new Date().getFullYear().toString(),
            cvv,
            zipCode: zipCode || '00000' // Default zipcode if not provided
        };
        // Process payment with PaidYET
        const paymentResult = yield processPaidYETPayment(Number(amount), cardDetails, `Security deposit/advance payment for check-in (${userId || 'Guest'})`);
        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            transactionId: paymentResult.transactionId,
            checkinStatus: 'completed',
            userId,
            amount,
            currency
        });
    }
    catch (error) {
        console.error('Payment error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Payment processing failed'
        });
    }
});
exports.makePayment = makePayment;
