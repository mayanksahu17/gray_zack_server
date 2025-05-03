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
exports.getGuestBookingHistory = exports.finalizeCheckIn = exports.calculateBookingSummary = exports.saveDraftCheckIn = void 0;
// bookingController.js
const booking_model_1 = __importDefault(require("../models/booking.model"));
const saveDraftCheckIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Save temporary check-in preferences
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.saveDraftCheckIn = saveDraftCheckIn;
const calculateBookingSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Calculate nights, add-ons, taxes, subtotal, total
        // Return breakdown
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.calculateBookingSummary = calculateBookingSummary;
const finalizeCheckIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Final steps:
        // - Create Booking
        // - Mark room occupied
        // - Save payment info
        // - Generate invoice if needed
        // Return success
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.finalizeCheckIn = finalizeCheckIn;
const getGuestBookingHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guestId = req.params.guestId;
        // Find all bookings for this guest and populate room details
        const bookings = yield booking_model_1.default.find({ guestId })
            .populate('roomId', 'roomNumber type') // Populate room details
            .populate('guestId', 'personalInfo') // Populate guest personal info
            .sort({ checkIn: -1 }); // Sort by check-in date, most recent first
        // Transform the bookings to include room details
        const bookingsWithRoomDetails = bookings.map(booking => (Object.assign(Object.assign({}, booking.toObject()), { roomDetails: booking.roomId })));
        res.status(200).json(bookingsWithRoomDetails);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getGuestBookingHistory = getGuestBookingHistory;
