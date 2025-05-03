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
exports.getPaymentsData = void 0;
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const guest_model_1 = __importDefault(require("../models/guest.model"));
const getPaymentsData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all completed invoices
        const invoices = yield invoice_model_1.default.find({ 'billing.status': { $in: ['paid', 'partial'] } }).lean();
        // Build transactions list
        const transactions = yield Promise.all(invoices.map((invoice) => __awaiter(void 0, void 0, void 0, function* () {
            const guest = yield guest_model_1.default.findById(invoice.guestId).lean();
            return {
                id: invoice.billing.transactionId || invoice._id.toString(),
                guest: guest ? `${guest.personalInfo.firstName} ${guest.personalInfo.lastName}` : 'Unknown',
                amount: `$${invoice.billing.paidAmount.toLocaleString()}`,
                date: invoice.issuedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                method: formatPaymentMethod(invoice.billing.method),
                status: capitalize(invoice.billing.status)
            };
        })));
        // Calculate payment method percentages
        const totalCount = invoices.length;
        const methodCounts = invoices.reduce((acc, invoice) => {
            const method = formatPaymentMethod(invoice.billing.method);
            acc[method] = (acc[method] || 0) + 1;
            return acc;
        }, {});
        const paymentMethods = Object.entries(methodCounts).map(([method, count]) => ({
            method,
            percentage: Math.round((count / totalCount) * 100)
        }));
        // Revenue by booking source
        const bookings = yield booking_model_1.default.find({ 'payment.status': 'paid' }).lean();
        const revenueMap = {};
        bookings.forEach((booking) => {
            const source = formatBookingSource(booking.bookingSource);
            revenueMap[source] = (revenueMap[source] || 0) + booking.payment.paidAmount;
        });
        const revenueBySource = Object.entries(revenueMap).map(([source, amount]) => ({
            source,
            amount
        }));
        return res.status(200).json({
            transactions,
            paymentMethods,
            revenueBySource
        });
    }
    catch (err) {
        console.error('Error generating payments data:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.getPaymentsData = getPaymentsData;
// Helper to capitalize status
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
// Normalize method labels
const formatPaymentMethod = (method) => {
    switch (method) {
        case 'credit_card':
            return 'Credit Card';
        case 'cash':
            return 'Cash';
        case 'corporate':
            return 'Corporate';
        case 'zifypay':
            return 'ZifyPay';
        case 'upi':
            return 'UPI';
        case 'online':
            return 'Online';
        default:
            return 'Other';
    }
};
// Normalize booking sources
const formatBookingSource = (source) => {
    switch (source) {
        case 'direct':
            return 'Direct Bookings';
        case 'booking_com':
            return 'Booking.com';
        case 'expedia':
            return 'Expedia';
        case 'airbnb':
            return 'Airbnb';
        default:
            return 'Others';
    }
};
