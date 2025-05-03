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
exports.getHotelDetails = exports.getAllHotelStaff = exports.upgradePlan = exports.getHotelRevenue = exports.getHotelAlerts = exports.getHotelAnalytics = exports.manageStaff = exports.createStaffRole = exports.updateHotelProfile = exports.getHotelById = exports.getAllHotels = exports.createHotel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const asyncHandler_1 = require("../utills/asyncHandler");
const ApiError_1 = require("../utills/ApiError");
const hotel_model_1 = __importDefault(require("../models/hotel.model"));
const staff_model_1 = __importDefault(require("../models/staff.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const nodemailer_1 = require("../lib/mail-service/nodemailer");
const render_1 = require("@react-email/render");
const notify_staff_1 = __importDefault(require("../lib/mail-service/mail-templates/notify-staff"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const room_model_1 = __importDefault(require("../models/room.model"));
const booking_model_1 = __importDefault(require("../models/booking.model"));
const booking_model_2 = require("../models/booking.model");
/**
 * Create a new hotel
 * @route POST /api/hotels
 * @access Private/Admin
 */
exports.createHotel = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, description, address, location, category, starRating, amenities, contactInfo, policies, } = req.body;
    // Get uploaded files
    const images = ((_a = req.files) === null || _a === void 0 ? void 0 : _a.map(file => file.path)) || [];
    const hotel = yield hotel_model_1.default.create({
        name,
        description,
        address,
        location,
        category,
        starRating,
        images,
        amenities,
        contactInfo,
        policies,
        adminId: req.user._id
    });
    return res.status(201).json({
        success: true,
        data: hotel
    });
}));
/**
 * Get all hotels
 * @route GET /api/hotels
 * @access Public
 */
const getAllHotels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotels = yield hotel_model_1.default.find({ isActive: true });
        res.status(200).json({
            success: true,
            count: hotels.length,
            data: hotels,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hotels',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.getAllHotels = getAllHotels;
/**
 * Get hotel by ID
 * @route GET /api/hotels/:id
 * @access Public
 */
const getHotelById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.default.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found',
            });
        }
        res.status(200).json({
            success: true,
            data: hotel,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hotel',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.getHotelById = getHotelById;
// Update Hotel Profile
exports.updateHotelProfile = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const updateData = req.body;
    const hotel = yield hotel_model_1.default.findOneAndUpdate({ _id: hotelId, adminId: req.user._id }, updateData, { new: true, runValidators: true });
    if (!hotel) {
        throw new ApiError_1.ApiError(404, "Hotel not found");
    }
    return res.status(200).json({
        success: true,
        data: hotel
    });
}));
// Create Staff Role
exports.createStaffRole = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const { role, permissions, password, status, name, email, phone } = req.body;
    // Step 1: Validate if hotel belongs to admin
    const hotel = yield hotel_model_1.default.findOne({ _id: hotelId, adminId: req.user._id });
    if (!hotel) {
        throw new ApiError_1.ApiError(404, "Hotel not found or you don't have permission to add staff to this hotel");
    }
    // Step 2: Validate all fields
    if (!role || !permissions || !password || !name || !email || !phone) {
        throw new ApiError_1.ApiError(400, "All fields are required");
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError_1.ApiError(400, "Invalid email format");
    }
    // Check if staff with this email already exists
    const existingStaff = yield staff_model_1.default.findOne({ email });
    if (existingStaff) {
        throw new ApiError_1.ApiError(409, "Staff with this email already exists");
    }
    // Validate permissions array
    if (!Array.isArray(permissions) || permissions.length === 0) {
        throw new ApiError_1.ApiError(400, "Permissions must be a non-empty array");
    }
    // Hash the password
    // const saltRounds = 10;
    // const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Generate tokens
    const accessToken = jsonwebtoken_1.default.sign({ email, role }, process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret', { expiresIn: '1d' });
    const refreshToken = jsonwebtoken_1.default.sign({ email }, process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret', { expiresIn: '7d' });
    // Step 3: Create a new staff member
    const newStaff = yield staff_model_1.default.create({
        hotelId: new mongoose_1.default.Types.ObjectId(hotelId),
        name,
        email,
        phone,
        role,
        permissions,
        password,
        status: status || 'active',
        refreshToken,
        accessToken,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    // Step 4: Send email notification
    let mailConfirmation = false;
    try {
        const emailHtml = (0, render_1.render)((0, jsx_runtime_1.jsx)(notify_staff_1.default, { name: name, role: role, hotelName: hotel.name, email: email, password: password }));
        // Make sure we have a string for the HTML content
        const htmlContent = typeof emailHtml === 'string'
            ? emailHtml
            : (emailHtml instanceof Promise
                ? yield emailHtml
                : String(emailHtml));
        yield nodemailer_1.auth.sendMail({
            from: 'scrimsscrown@gmail.com',
            to: email,
            subject: `Welcome to ${hotel.name} - Your Staff Account`,
            html: htmlContent
        });
        mailConfirmation = true;
    }
    catch (error) {
        mailConfirmation = false;
        console.error('Failed to send staff notification email:', error);
        // Continue with the process even if email fails
    }
    // Don't include sensitive information in the response
    const staffResponse = {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        permissions: newStaff.permissions,
        status: newStaff.status,
        createdAt: newStaff.createdAt,
        mailConfirmation
    };
    return res.status(201).json({
        success: true,
        message: "Staff member created successfully",
        data: staffResponse
    });
}));
// Manage Staff
exports.manageStaff = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const { name, email, phone, role, permissions, password } = req.body;
    const staff = yield staff_model_1.default.create({
        hotelId,
        name,
        email,
        phone,
        role,
        permissions,
        password
    });
    return res.status(201).json({
        success: true,
        data: staff
    });
}));
// Get Hotel Analytics
exports.getHotelAnalytics = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;
    // Implement analytics logic here
    // This would typically involve aggregating data from various collections
    return res.status(200).json({
        success: true,
        data: {
            occupancyRate: 0,
            averageRating: 0,
            totalBookings: 0,
            // ... other analytics
        }
    });
}));
// Get Hotel System Alerts
exports.getHotelAlerts = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const alerts = [];
    try {
        // 1. Check if all systems are operational
        // This would typically check connections to various services
        alerts.push({
            type: 'success',
            message: 'All systems operational',
            time: 'Just now'
        });
        // 2. Check for maintenance issues
        const rooms = yield room_model_1.default.find({
            hotelId,
            status: 'maintenance'
        });
        if (rooms.length > 0) {
            alerts.push({
                type: 'warning',
                message: `Room ${rooms[0].roomNumber} maintenance scheduled`,
                time: `${Math.floor(Math.random() * 60)} min ago`
            });
        }
        // 3. Check for overbooking issues
        const today = new Date();
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);
        // Get all rooms
        const totalRooms = yield room_model_1.default.countDocuments({ hotelId });
        // For each day in the next 30 days, check if there are more bookings than rooms
        for (let date = today; date <= thirtyDaysLater; date.setDate(date.getDate() + 1)) {
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            // Count bookings that will be active on this date
            const bookingsCount = yield booking_model_1.default.countDocuments({
                hotelId,
                checkIn: { $lte: nextDay },
                expectedCheckOut: { $gt: date },
                status: { $in: [booking_model_2.BookingStatus.BOOKED, booking_model_2.BookingStatus.CHECKED_IN] }
            });
            if (bookingsCount > totalRooms) {
                const datePart = date.toISOString().split('T')[0];
                alerts.push({
                    type: 'error',
                    message: `Overbooking detected for ${datePart}`,
                    time: '1 hour ago'
                });
                break; // Only report the first overbooking
            }
        }
        // 4. Check for low inventory items
        // This would typically come from an inventory collection
        // For demonstration, we'll simulate it
        const lowInventoryItems = Math.floor(Math.random() * 3); // 0-2 low inventory items
        if (lowInventoryItems > 0) {
            alerts.push({
                type: 'warning',
                message: `${lowInventoryItems} inventory items running low`,
                time: '3 hours ago'
            });
        }
        return res.status(200).json(alerts);
    }
    catch (error) {
        console.error('Error fetching hotel alerts:', error);
        return res.status(500).json({ message: 'Failed to fetch hotel alerts' });
    }
}));
// Get Hotel Revenue
exports.getHotelRevenue = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const { period } = req.query;
    // Implement revenue calculation logic
    // This would typically involve aggregating booking and payment data
    return res.status(200).json({
        success: true,
        data: {
            totalRevenue: 0,
            revenueByCategory: {},
            // ... other revenue metrics
        }
    });
}));
// Upgrade Plan
exports.upgradePlan = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const { planId } = req.body;
    // Implement plan upgrade logic
    // This would typically involve payment processing and updating subscription status
    return res.status(200).json({
        success: true,
        message: "Plan upgraded successfully"
    });
}));
// Get All Hotel Staff
exports.getAllHotelStaff = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const { role, status, page = 1, limit = 10 } = req.query;
    const query = { hotelId };
    if (role)
        query.role = role;
    if (status)
        query.status = status;
    const staff = yield staff_model_1.default.find(query)
        .select('-password -refreshToken')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort({ createdAt: -1 });
    const total = yield staff_model_1.default.countDocuments(query);
    return res.status(200).json({
        success: true,
        data: staff,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        }
    });
}));
// Get Hotel Details
exports.getHotelDetails = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const hotel = yield hotel_model_1.default.findOne({
        _id: hotelId,
        adminId: req.user._id
    });
    if (!hotel) {
        throw new ApiError_1.ApiError(404, "Hotel not found");
    }
    return res.status(200).json({
        success: true,
        data: hotel
    });
}));
