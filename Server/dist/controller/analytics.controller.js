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
exports.getSystemAlerts = exports.getMonthlyOccupancy = exports.getMonthlyRevenue = exports.getRoomServiceOrders = exports.getActiveReservations = exports.getOccupancyRateToday = exports.getTodayRevenue = exports.getTodaysTimeline = void 0;
const booking_model_1 = __importDefault(require("../models/booking.model"));
const dayjs_1 = __importDefault(require("dayjs"));
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const isBetween_1 = __importDefault(require("dayjs/plugin/isBetween"));
// You may need to import Room if not already globally registered
const room_model_1 = __importDefault(require("../models/room.model"));
const RoomService_model_1 = __importDefault(require("../models/RoomService.model"));
dayjs_1.default.extend(isBetween_1.default);
const getTodaysTimeline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelId = req.query.hotelId;
        const startOfDay = (0, dayjs_1.default)().startOf('day').toDate();
        const endOfDay = (0, dayjs_1.default)().endOf('day').toDate();
        const filter = {
            $or: [
                { actualCheckOut: { $gte: startOfDay, $lte: endOfDay } },
                { status: 'checked_in', createdAt: { $gte: startOfDay, $lte: endOfDay } }
            ]
        };
        if (hotelId) {
            filter.hotelId = hotelId;
        }
        const bookings = yield booking_model_1.default.find(filter)
            .populate('guestId', 'personalInfo')
            .populate('roomId', 'number')
            .sort({ createdAt: 1, actualCheckOut: 1 });
        const timeline = bookings.flatMap((b) => {
            var _a, _b;
            const guest = (_a = b.guestId) === null || _a === void 0 ? void 0 : _a.personalInfo;
            const room = ((_b = b.roomId) === null || _b === void 0 ? void 0 : _b.number) || 'Unknown';
            const entries = [];
            if (b.status === 'checked_in' && (0, dayjs_1.default)(b.createdAt).isBetween(startOfDay, endOfDay, null, '[]')) {
                entries.push({
                    time: (0, dayjs_1.default)(b.createdAt).format('hh:mm A'),
                    event: 'Check-in',
                    room,
                    guest: `${guest.firstName} ${guest.lastName}`
                });
            }
            if (b.actualCheckOut && (0, dayjs_1.default)(b.actualCheckOut).isBetween(startOfDay, endOfDay, null, '[]')) {
                entries.push({
                    time: (0, dayjs_1.default)(b.actualCheckOut).format('hh:mm A'),
                    event: 'Check-out',
                    room,
                    guest: `${guest.firstName} ${guest.lastName}`
                });
            }
            return entries;
        });
        timeline.sort((a, b) => (0, dayjs_1.default)(a.time, 'hh:mm A').unix() - (0, dayjs_1.default)(b.time, 'hh:mm A').unix());
        res.status(200).json(timeline);
    }
    catch (error) {
        console.error('[ERROR] Fetching timeline:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getTodaysTimeline = getTodaysTimeline;
const getTodayRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const todayStart = (0, dayjs_1.default)().startOf('day').toDate();
        const todayEnd = (0, dayjs_1.default)().endOf('day').toDate();
        const result = yield invoice_model_1.default.aggregate([
            {
                $match: {
                    issuedAt: {
                        $gte: todayStart,
                        $lte: todayEnd
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);
        const revenueToday = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
        res.status(200).json({
            title: 'Revenue Today',
            value: `$${revenueToday.toLocaleString()}`,
            change: '+12%', // Placeholder, dynamic comparison can be added later
            trend: 'up' // Placeholder too
        });
        console.log(res.status);
    }
    catch (error) {
        console.error("Error fetching today's revenue:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getTodayRevenue = getTodayRevenue;
const getOccupancyRateToday = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId } = req.query;
        const today = new Date();
        // Fix the handling of dates to avoid modifying the same date object
        const startDate = (0, dayjs_1.default)().startOf('day').toDate();
        const endDate = (0, dayjs_1.default)().endOf('day').toDate();
        // Find active bookings for today
        const filter = {
            status: { $in: ['booked', 'checked_in'] },
            checkIn: { $lte: endDate },
            $or: [
                { actualCheckOut: { $gt: startDate } },
                { expectedCheckOut: { $gte: startDate }, actualCheckOut: null }
            ]
        };
        if (hotelId) {
            filter.hotelId = hotelId;
        }
        // Count active bookings
        const activeBookings = yield booking_model_1.default.countDocuments(filter);
        // Get total available rooms
        const rooms = yield room_model_1.default.countDocuments(hotelId ? { hotelId } : {});
        if (rooms === 0) {
            return res.status(200).json({
                title: 'Occupancy Rate',
                value: '0%',
                change: "+5%",
                trend: "up"
            });
        }
        // Calculate occupancy rate
        const occupancyRate = (activeBookings / rooms) * 100;
        res.status(200).json({
            title: 'Occupancy Rate',
            value: `${occupancyRate.toFixed(2)}%`,
            change: "+5%",
            trend: "up"
        });
    }
    catch (error) {
        console.error('Error calculating occupancy rate:', error);
        res.status(500).json({ message: 'Error calculating occupancy rate' });
    }
});
exports.getOccupancyRateToday = getOccupancyRateToday;
const getActiveReservations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId } = req.query;
        const today = (0, dayjs_1.default)();
        const lastWeek = today.subtract(7, 'day');
        // Current period
        const filter = {
            status: { $in: ['booked', 'checked_in'] }
        };
        if (hotelId) {
            filter.hotelId = hotelId;
        }
        const activeReservations = yield booking_model_1.default.countDocuments(filter);
        // Last week's period for comparison
        const lastWeekFilter = Object.assign(Object.assign({}, filter), { createdAt: { $lte: lastWeek.endOf('day').toDate() } });
        const lastWeekReservations = yield booking_model_1.default.countDocuments(lastWeekFilter);
        // Calculate change percentage
        let changePercent = 0;
        let trend = 'flat';
        if (lastWeekReservations > 0) {
            changePercent = ((activeReservations - lastWeekReservations) / lastWeekReservations) * 100;
            trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'flat';
        }
        res.status(200).json({
            title: 'Active Reservations',
            value: activeReservations.toString(),
            change: `${Math.abs(changePercent).toFixed(0)}%`,
            trend
        });
    }
    catch (error) {
        console.error('Error fetching active reservations:', error);
        res.status(500).json({ message: 'Error fetching active reservations' });
    }
});
exports.getActiveReservations = getActiveReservations;
const getRoomServiceOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId } = req.query;
        const today = (0, dayjs_1.default)();
        const startOfDay = today.startOf('day').toDate();
        const endOfDay = today.endOf('day').toDate();
        const lastWeek = today.subtract(7, 'day');
        const lastWeekStart = lastWeek.startOf('day').toDate();
        const lastWeekEnd = lastWeek.endOf('day').toDate();
        // Current day's orders
        const filter = {
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };
        if (hotelId) {
            filter.hotelId = hotelId;
        }
        const todayOrders = yield RoomService_model_1.default.countDocuments(filter);
        // Last week's same day for comparison
        const lastWeekFilter = Object.assign(Object.assign({}, filter), { createdAt: {
                $gte: lastWeekStart,
                $lte: lastWeekEnd
            } });
        const lastWeekOrders = yield RoomService_model_1.default.countDocuments(lastWeekFilter);
        // Calculate change percentage
        let changePercent = 0;
        let trend = 'flat';
        if (lastWeekOrders > 0) {
            changePercent = ((todayOrders - lastWeekOrders) / lastWeekOrders) * 100;
            trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'flat';
        }
        else if (todayOrders > 0) {
            // If last week was 0 but today has orders, show 100% increase
            changePercent = 100;
            trend = 'up';
        }
        res.status(200).json({
            title: 'Room Service Orders',
            value: todayOrders.toString(),
            change: `${Math.abs(changePercent).toFixed(0)}%`,
            trend
        });
    }
    catch (error) {
        console.error('Error fetching room service orders:', error);
        res.status(500).json({ message: 'Error fetching room service orders' });
    }
});
exports.getRoomServiceOrders = getRoomServiceOrders;
const getMonthlyRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { year } = req.query;
        // Default to current year if not specified
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        // Create startDate and endDate for the target year
        const startDate = new Date(targetYear, 0, 1); // January 1st of target year
        const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999); // December 31st of target year
        // Aggregate monthly revenue
        const monthlyRevenue = yield invoice_model_1.default.aggregate([
            {
                $match: {
                    issuedAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$issuedAt" },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        // Convert the month numbers to month names and format the result
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // Initialize with all months at 0 revenue
        const formattedData = months.map((month, index) => ({
            date: month,
            revenue: 0
        }));
        // Fill in actual revenue data where it exists
        monthlyRevenue.forEach(item => {
            const monthIndex = item._id - 1; // MongoDB months are 1-indexed
            if (monthIndex >= 0 && monthIndex < 12) {
                formattedData[monthIndex].revenue = item.revenue;
            }
        });
        res.status(200).json(formattedData);
    }
    catch (error) {
        console.error("Error fetching monthly revenue:", error);
        res.status(500).json({ message: "Error fetching monthly revenue" });
    }
});
exports.getMonthlyRevenue = getMonthlyRevenue;
const getMonthlyOccupancy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { year, hotelId } = req.query;
        // Default to current year if not specified
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        // Initialize result array with all months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedData = months.map((month, index) => ({
            date: month,
            occupancy: 0
        }));
        // For each month, we'll need to calculate occupancy rate
        for (let month = 0; month < 12; month++) {
            const startOfMonth = new Date(targetYear, month, 1);
            const endOfMonth = new Date(targetYear, month + 1, 0, 23, 59, 59, 999);
            const daysInMonth = endOfMonth.getDate();
            // Count total rooms available for the hotel
            const filter = hotelId ? { hotelId } : {};
            const totalRooms = yield room_model_1.default.countDocuments(filter);
            if (totalRooms === 0) {
                continue; // Skip if no rooms exist
            }
            // Get all bookings active during this month
            const bookingFilter = {
                checkIn: { $lte: endOfMonth },
                $or: [
                    { actualCheckOut: { $gte: startOfMonth } },
                    { expectedCheckOut: { $gte: startOfMonth }, actualCheckOut: null }
                ],
                status: { $in: ['booked', 'checked_in', 'checked_out'] }
            };
            if (hotelId) {
                bookingFilter.hotelId = hotelId;
            }
            const bookings = yield booking_model_1.default.find(bookingFilter);
            // Calculate room-nights booked
            let occupiedRoomNights = 0;
            bookings.forEach(booking => {
                // Determine overlap with month
                const bookingStart = (0, dayjs_1.default)(booking.checkIn).isAfter((0, dayjs_1.default)(startOfMonth))
                    ? booking.checkIn
                    : startOfMonth;
                const bookingEnd = booking.actualCheckOut
                    ? ((0, dayjs_1.default)(booking.actualCheckOut).isBefore((0, dayjs_1.default)(endOfMonth))
                        ? booking.actualCheckOut
                        : endOfMonth)
                    : ((0, dayjs_1.default)(booking.expectedCheckOut).isBefore((0, dayjs_1.default)(endOfMonth))
                        ? booking.expectedCheckOut
                        : endOfMonth);
                // Calculate number of nights (including partial days)
                const nights = Math.ceil((0, dayjs_1.default)(bookingEnd).diff((0, dayjs_1.default)(bookingStart), 'day', true));
                occupiedRoomNights += Math.max(0, nights); // Ensure no negative nights
            });
            // Calculate occupancy rate (room-nights booked / total room-nights available)
            const totalRoomNights = totalRooms * daysInMonth;
            const occupancyRate = (occupiedRoomNights / totalRoomNights) * 100;
            // Add to result
            formattedData[month].occupancy = Math.round(occupancyRate);
        }
        res.status(200).json(formattedData);
    }
    catch (error) {
        console.error("Error calculating monthly occupancy:", error);
        res.status(500).json({ message: "Error calculating monthly occupancy" });
    }
});
exports.getMonthlyOccupancy = getMonthlyOccupancy;
const getSystemAlerts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId } = req.query;
        const timeframe = parseInt(req.query.timeframe || '24');
        // Get a timestamp from X hours ago (default 24 hours)
        const cutoffTime = (0, dayjs_1.default)().subtract(timeframe, 'hour').toDate();
        // Mock data structure - in a real system this would come from a database
        // You would replace this with actual alerts from your database
        const alertTypes = {
            success: [
                { message: "All systems operational", time: (0, dayjs_1.default)().subtract(1, 'minute').toDate() },
            ],
            warning: [
                { message: "Room maintenance scheduled", time: (0, dayjs_1.default)().subtract(10, 'minute').toDate() },
                { message: "Low inventory on bathroom supplies", time: (0, dayjs_1.default)().subtract(3, 'hour').toDate() },
            ],
            error: [
                { message: "Overbooking detected", time: (0, dayjs_1.default)().subtract(1, 'hour').toDate() },
                { message: "Payment processing system issue", time: (0, dayjs_1.default)().subtract(5, 'hour').toDate() },
            ]
        };
        // Format the alerts
        const allAlerts = [
            ...alertTypes.success.map(alert => (Object.assign(Object.assign({}, alert), { type: "success" }))),
            ...alertTypes.warning.map(alert => (Object.assign(Object.assign({}, alert), { type: "warning" }))),
            ...alertTypes.error.map(alert => (Object.assign(Object.assign({}, alert), { type: "error" })))
        ];
        // Filter by cutoff time
        const recentAlerts = allAlerts
            .filter(alert => alert.time >= cutoffTime)
            .map(alert => (Object.assign(Object.assign({}, alert), { time: formatAlertTime(alert.time) })))
            .sort((a, b) => (0, dayjs_1.default)(b.time).unix() - (0, dayjs_1.default)(a.time).unix());
        res.status(200).json(recentAlerts);
    }
    catch (error) {
        console.error("Error fetching system alerts:", error);
        res.status(500).json({ message: "Error fetching system alerts" });
    }
});
exports.getSystemAlerts = getSystemAlerts;
// Helper function to format alert times in a user-friendly way
function formatAlertTime(date) {
    const now = (0, dayjs_1.default)();
    const alertTime = (0, dayjs_1.default)(date);
    const diffMinutes = now.diff(alertTime, 'minute');
    if (diffMinutes < 1)
        return "Just now";
    if (diffMinutes < 60)
        return `${diffMinutes} min ago`;
    const diffHours = now.diff(alertTime, 'hour');
    if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = now.diff(alertTime, 'day');
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
