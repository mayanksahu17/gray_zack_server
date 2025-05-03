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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["BOOKED"] = "booked";
    BookingStatus["CHECKED_IN"] = "checked_in";
    BookingStatus["CHECKED_OUT"] = "checked_out";
    BookingStatus["CANCELLED"] = "cancelled";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
const addOnSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    cost: { type: Number, required: true, min: 0 }
}, { _id: false });
const paymentInfoSchema = new mongoose_1.Schema({
    method: {
        type: String,
        required: true,
        enum: ['credit_card', 'cash', 'corporate', 'online', 'zifypay', 'upi', 'other']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'authorized', 'paid', 'refunded'],
        default: 'pending'
    },
    securityDeposit: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    last4Digits: { type: String, trim: true },
    transactionId: { type: String, trim: true }
}, { _id: false });
const bookingSchema = new mongoose_1.Schema({
    hotelId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Hotel' },
    guestId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Guest' },
    roomId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Room' },
    checkIn: { type: Date, required: true },
    expectedCheckOut: { type: Date, required: true },
    actualCheckOut: { type: Date },
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, required: true, min: 0 },
    cardKey: { type: String, trim: true },
    addOns: { type: [addOnSchema], default: [] },
    payment: { type: paymentInfoSchema, required: true },
    status: {
        type: String,
        enum: Object.values(BookingStatus),
        required: true,
        default: BookingStatus.BOOKED
    },
    bookingSource: {
        type: String,
        enum: ['direct', 'booking_com', 'expedia', 'airbnb', 'others'],
        required: true,
        default: 'direct'
    }
}, {
    timestamps: true,
    versionKey: false
});
bookingSchema.index({ guestId: 1, status: 1 });
bookingSchema.index({ roomId: 1, checkIn: 1, expectedCheckOut: 1 });
const Booking = mongoose_1.default.model('Booking', bookingSchema);
exports.default = Booking;
