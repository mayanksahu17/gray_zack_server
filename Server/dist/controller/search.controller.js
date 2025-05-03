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
exports.unifiedSearch = void 0;
const guest_model_1 = __importDefault(require("../models/guest.model"));
const room_model_1 = __importDefault(require("../models/room.model"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const unifiedSearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Missing search query' });
    }
    const searchRegex = new RegExp(q, 'i');
    const isObjectId = mongoose_1.default.Types.ObjectId.isValid(q);
    try {
        // Search Guests (by name, email, phone, idNumber)
        const guestOr = [
            { 'personalInfo.firstName': searchRegex },
            { 'personalInfo.lastName': searchRegex },
            { 'personalInfo.email': searchRegex },
            { 'personalInfo.phone': searchRegex },
            { 'personalInfo.idNumber': searchRegex },
        ];
        if (isObjectId)
            guestOr.push({ _id: q });
        const guestQuery = { $or: guestOr };
        const guests = yield guest_model_1.default.find(guestQuery).limit(10);
        // Search Rooms (by roomNumber or type)
        const roomOr = [
            { roomNumber: searchRegex },
            { type: searchRegex }
        ];
        if (isObjectId)
            roomOr.push({ _id: q });
        const roomQuery = { $or: roomOr };
        const rooms = yield room_model_1.default.find(roomQuery).limit(10);
        // Search Reservations (by reservation number or guest name)
        let reservationQuery = [
            { _id: isObjectId ? q : undefined },
        ];
        // Find guest IDs matching the name
        const guestIds = guests.map(g => g._id);
        if (guestIds.length > 0) {
            reservationQuery.push({ guestId: { $in: guestIds } });
        }
        // Also allow searching by room number
        const roomIds = rooms.map(r => r._id);
        if (roomIds.length > 0) {
            reservationQuery.push({ roomId: { $in: roomIds } });
        }
        // Remove undefined
        reservationQuery = reservationQuery.filter(Boolean);
        const bookings = yield booking_model_1.default.find(reservationQuery.length ? { $or: reservationQuery } : {}).limit(10)
            .populate('guestId', 'personalInfo.firstName personalInfo.lastName personalInfo.email')
            .populate('roomId', 'roomNumber type');
        res.json({
            guests,
            rooms,
            reservations: bookings
        });
    }
    catch (error) {
        console.error('Unified search error:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});
exports.unifiedSearch = unifiedSearch;
