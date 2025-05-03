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
exports.getAvailableReports = exports.getGuestFeedback = exports.getRevenueByRoomType = exports.getOccupancyTrend = void 0;
const booking_model_1 = __importDefault(require("../models/booking.model"));
const room_model_1 = __importDefault(require("../models/room.model"));
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const dayjs_1 = __importDefault(require("dayjs"));
const getOccupancyTrend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { year, hotelId } = req.query;
        // Default to current year if not specified
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        // Initialize result array with all months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedData = months.map((month, index) => ({
            month,
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
        console.error("Error calculating occupancy trend:", error);
        res.status(500).json({ message: "Error calculating occupancy trend" });
    }
});
exports.getOccupancyTrend = getOccupancyTrend;
const getRevenueByRoomType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { year, hotelId } = req.query;
        // Default to current year if not specified
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        // Set date range for the target year
        const startDate = new Date(targetYear, 0, 1); // January 1st
        const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999); // December 31st
        // Find all invoices for this period
        const invoiceFilter = {
            issuedAt: {
                $gte: startDate,
                $lte: endDate
            }
        };
        if (hotelId) {
            invoiceFilter.hotelId = hotelId;
        }
        // Get all bookings with their associated room IDs
        const bookingsWithRooms = yield booking_model_1.default.find(hotelId ? { hotelId } : {}).populate('roomId', 'type');
        // Create a map of booking ID to room type
        const bookingToRoomType = new Map();
        bookingsWithRooms.forEach((booking) => {
            if (booking.roomId && booking.roomId.type) {
                bookingToRoomType.set(booking._id.toString(), booking.roomId.type);
            }
        });
        // Get all invoices
        const invoices = yield invoice_model_1.default.find(invoiceFilter).populate('bookingId');
        // Calculate revenue by room type
        const revenueByType = new Map();
        // Set initial values for standard room types
        const standardRoomTypes = ["Standard", "Deluxe", "Suite", "Executive"];
        standardRoomTypes.forEach(type => revenueByType.set(type, 0));
        // Aggregate revenue by room type
        invoices.forEach(invoice => {
            var _a, _b;
            const bookingId = (_b = (_a = invoice.bookingId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
            if (bookingId && bookingToRoomType.has(bookingId)) {
                const roomType = bookingToRoomType.get(bookingId);
                revenueByType.set(roomType, (revenueByType.get(roomType) || 0) + invoice.totalAmount);
            }
        });
        // Format the data for response
        const formattedData = Array.from(revenueByType.entries()).map(([type, revenue]) => ({
            type,
            revenue: Math.round(revenue)
        }));
        res.status(200).json(formattedData);
    }
    catch (error) {
        console.error("Error calculating revenue by room type:", error);
        res.status(500).json({ message: "Error calculating revenue by room type" });
    }
});
exports.getRevenueByRoomType = getRevenueByRoomType;
const getGuestFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real implementation, this would fetch from a feedback/ratings database
        // For now, we'll return mock data that matches the expected format
        const feedbackData = [
            { category: "Cleanliness", rating: 4.5 },
            { category: "Service", rating: 4.7 },
            { category: "Amenities", rating: 4.2 },
            { category: "Food", rating: 4.6 },
            { category: "Value", rating: 4.3 },
            { category: "Location", rating: 4.8 },
        ];
        res.status(200).json(feedbackData);
    }
    catch (error) {
        console.error("Error fetching guest feedback:", error);
        res.status(500).json({ message: "Error fetching guest feedback" });
    }
});
exports.getGuestFeedback = getGuestFeedback;
const getAvailableReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real implementation, this would fetch from a reports database
        // For now, we'll return mock data that matches the expected format
        const reportsData = [
            { name: "Monthly Revenue Report", format: "PDF/CSV", lastGenerated: "Jul 1, 2023" },
            { name: "Occupancy Analysis", format: "PDF/CSV", lastGenerated: "Jun 30, 2023" },
            { name: "Staff Performance Report", format: "PDF", lastGenerated: "Jun 15, 2023" },
            { name: "Guest Feedback Summary", format: "PDF", lastGenerated: "Jun 30, 2023" },
            { name: "Inventory Status Report", format: "CSV", lastGenerated: "Jul 5, 2023" },
        ];
        res.status(200).json(reportsData);
    }
    catch (error) {
        console.error("Error fetching available reports:", error);
        res.status(500).json({ message: "Error fetching available reports" });
    }
});
exports.getAvailableReports = getAvailableReports;
