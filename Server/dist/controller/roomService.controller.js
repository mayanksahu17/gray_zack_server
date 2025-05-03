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
exports.getPendingCharges = exports.updateRoomServiceStatus = exports.getRoomServiceCharges = exports.createRoomServiceCharge = exports.getActiveBookings = void 0;
const RoomService_model_1 = __importDefault(require("../models/RoomService.model"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const booking_model_2 = require("../models/booking.model");
// Get active bookings for restaurant POS
const getActiveBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId } = req.params;
        const activeBookings = yield booking_model_1.default.find({
            hotelId,
            status: { $in: [booking_model_2.BookingStatus.BOOKED, booking_model_2.BookingStatus.CHECKED_IN] }
        })
            .populate('roomId', 'roomNumber floor')
            .populate('guestId', 'personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone personalInfo.address')
            .select('roomId guestId checkIn expectedCheckOut status');
        res.status(200).json({
            success: true,
            data: activeBookings
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active bookings',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getActiveBookings = getActiveBookings;
// Create room service charge
const createRoomServiceCharge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId, roomId, orderId, hotelId, amount } = req.body;
        // Verify active booking
        const booking = yield booking_model_1.default.findOne({
            _id: bookingId,
            status: { $in: [booking_model_2.BookingStatus.BOOKED, booking_model_2.BookingStatus.CHECKED_IN] }
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'No active booking found for this room'
            });
        }
        const roomService = yield RoomService_model_1.default.create({
            bookingId,
            roomId,
            orderId,
            hotelId,
            amount,
            status: 'pending',
            chargedToRoom: true
        });
        res.status(201).json({
            success: true,
            data: roomService
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating room service charge',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.createRoomServiceCharge = createRoomServiceCharge;
// Get room service charges for a booking
const getRoomServiceCharges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const charges = yield RoomService_model_1.default.find({ bookingId })
            .populate('orderId')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: charges
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching room service charges',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getRoomServiceCharges = getRoomServiceCharges;
// Update room service charge status
const updateRoomServiceStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, addedToInvoice } = req.body;
        const roomService = yield RoomService_model_1.default.findByIdAndUpdate(id, { status, addedToInvoice }, { new: true });
        if (!roomService) {
            return res.status(404).json({
                success: false,
                message: 'Room service charge not found'
            });
        }
        res.status(200).json({
            success: true,
            data: roomService
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating room service status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.updateRoomServiceStatus = updateRoomServiceStatus;
// Get pending room service charges for checkout
const getPendingCharges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const pendingCharges = yield RoomService_model_1.default.find({
            bookingId,
            status: 'pending',
            addedToInvoice: false
        }).populate('orderId');
        const total = pendingCharges.reduce((sum, charge) => sum + charge.amount, 0);
        res.status(200).json({
            success: true,
            data: {
                charges: pendingCharges,
                total
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pending charges',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getPendingCharges = getPendingCharges;
