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
exports.getDashboardData = void 0;
const booking_model_1 = __importDefault(require("../models/booking.model"));
const room_model_1 = __importDefault(require("../models/room.model"));
const booking_model_2 = require("../models/booking.model");
const room_model_2 = require("../models/room.model");
const date_fns_1 = require("date-fns");
const dayjs_1 = __importDefault(require("dayjs"));
const isBetween_1 = __importDefault(require("dayjs/plugin/isBetween"));
dayjs_1.default.extend(isBetween_1.default);
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const startOfDay = (0, dayjs_1.default)().startOf('day').toDate();
        const endOfDay = (0, dayjs_1.default)().endOf('day').toDate();
        const tomorrow = (0, dayjs_1.default)().add(1, 'day').startOf('day').toDate();
        const day2 = (0, dayjs_1.default)().add(2, 'day').startOf('day').toDate();
        const day3 = (0, dayjs_1.default)().add(3, 'day').startOf('day').toDate();
        // Get today's check-ins and check-outs using the same approach as analytics
        const filter = {
            $or: [
                { actualCheckOut: { $gte: startOfDay, $lte: endOfDay } },
                { status: booking_model_2.BookingStatus.CHECKED_IN, createdAt: { $gte: startOfDay, $lte: endOfDay } }
            ]
        };
        const todayBookings = yield booking_model_1.default.find(filter)
            .populate('guestId', 'firstName lastName')
            .populate('roomId', 'roomNumber');
        // Separate check-ins and check-outs
        const todayCheckIns = todayBookings.filter(booking => booking.status === booking_model_2.BookingStatus.CHECKED_IN &&
            (0, dayjs_1.default)(booking.createdAt).isBetween(startOfDay, endOfDay, null, '[]'));
        const todayCheckOuts = todayBookings.filter(booking => booking.actualCheckOut &&
            (0, dayjs_1.default)(booking.actualCheckOut).isBetween(startOfDay, endOfDay, null, '[]'));
        // Get room status counts
        const roomStatusCounts = yield room_model_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        // Get upcoming reservations (next 3 days)
        const upcomingReservations = {
            tomorrow: yield booking_model_1.default.find({
                checkIn: {
                    $gte: tomorrow,
                    $lt: day2
                },
                status: booking_model_2.BookingStatus.BOOKED
            }).populate('guestId', 'firstName lastName')
                .populate('roomId', 'roomNumber type'),
            day2: yield booking_model_1.default.find({
                checkIn: {
                    $gte: day2,
                    $lt: day3
                },
                status: booking_model_2.BookingStatus.BOOKED
            }).populate('guestId', 'firstName lastName')
                .populate('roomId', 'roomNumber type'),
            day3: yield booking_model_1.default.find({
                checkIn: {
                    $gte: day3,
                    $lt: (0, dayjs_1.default)(day3).add(1, 'day').toDate()
                },
                status: booking_model_2.BookingStatus.BOOKED
            }).populate('guestId', 'firstName lastName')
                .populate('roomId', 'roomNumber type')
        };
        // Format the response
        const response = {
            todayCheckIns: todayCheckIns.map(booking => ({
                id: booking._id,
                name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
                time: (0, date_fns_1.format)(booking.createdAt, 'h:mm a'),
                room: booking.roomId.roomNumber
            })),
            todayCheckOuts: todayCheckOuts.map(booking => ({
                id: booking._id,
                name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
                room: booking.roomId.roomNumber
            })),
            roomStatus: {
                available: ((_a = roomStatusCounts.find(r => r._id === room_model_2.RoomStatus.AVAILABLE)) === null || _a === void 0 ? void 0 : _a.count) || 0,
                occupied: ((_b = roomStatusCounts.find(r => r._id === room_model_2.RoomStatus.OCCUPIED)) === null || _b === void 0 ? void 0 : _b.count) || 0,
                cleaning: ((_c = roomStatusCounts.find(r => r._id === room_model_2.RoomStatus.CLEANING)) === null || _c === void 0 ? void 0 : _c.count) || 0,
                maintenance: ((_d = roomStatusCounts.find(r => r._id === room_model_2.RoomStatus.MAINTENANCE)) === null || _d === void 0 ? void 0 : _d.count) || 0
            },
            upcomingReservations: {
                tomorrow: upcomingReservations.tomorrow.map(booking => ({
                    id: booking._id,
                    name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
                    roomType: booking.roomId.type,
                    nights: Math.ceil((booking.expectedCheckOut.getTime() - booking.checkIn.getTime()) / (24 * 60 * 60 * 1000)),
                    time: (0, date_fns_1.format)(booking.checkIn, 'h:mm a'),
                    status: booking.status
                })),
                day2: upcomingReservations.day2.map(booking => ({
                    id: booking._id,
                    name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
                    roomType: booking.roomId.type,
                    nights: Math.ceil((booking.expectedCheckOut.getTime() - booking.checkIn.getTime()) / (24 * 60 * 60 * 1000)),
                    time: (0, date_fns_1.format)(booking.checkIn, 'h:mm a'),
                    status: booking.status
                })),
                day3: upcomingReservations.day3.map(booking => ({
                    id: booking._id,
                    name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
                    roomType: booking.roomId.type,
                    nights: Math.ceil((booking.expectedCheckOut.getTime() - booking.checkIn.getTime()) / (24 * 60 * 60 * 1000)),
                    time: (0, date_fns_1.format)(booking.checkIn, 'h:mm a'),
                    status: booking.status
                }))
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
exports.getDashboardData = getDashboardData;
