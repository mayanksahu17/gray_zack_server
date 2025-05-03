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
exports.logoutStaff = exports.refreshToken = exports.deleteStaff = exports.updateStaff = exports.getStaffByHotel = exports.loginStaff = void 0;
const staff_model_1 = __importDefault(require("../models/staff.model"));
const ApiError_1 = require("../utills/ApiError");
const asyncHandler_1 = require("../utills/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const generateTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staff = yield staff_model_1.default.findById(userId);
        if (!staff) {
            throw new ApiError_1.ApiError(404, 'Staff member not found');
        }
        const accessToken = staff.generateAccessToken();
        const refreshToken = staff.generateRefreshToken();
        staff.refreshToken = refreshToken;
        staff.accessToken = accessToken;
        yield staff.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Error generating tokens");
    }
});
// Staff login
exports.loginStaff = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError_1.ApiError(400, "Email and password are required");
    }
    const staff = yield staff_model_1.default.findOne({ email: email.toLowerCase() }).select('+password');
    if (!staff) {
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    }
    if (staff.status === 'inactive') {
        throw new ApiError_1.ApiError(403, "Account is inactive");
    }
    console.log(password);
    const isPasswordValid = yield staff.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = yield generateTokens(staff._id);
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(200).json({
        success: true,
        data: {
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            hotelId: staff.hotelId
        }
    });
}));
// Get staff by hotel
exports.getStaffByHotel = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotelId } = req.params;
    const { page = 1, limit = 10, role, status } = req.query;
    if (!mongoose_1.default.Types.ObjectId.isValid(hotelId)) {
        throw new ApiError_1.ApiError(400, "Invalid hotel ID format");
    }
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
// Update staff member
exports.updateStaff = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, phone, role, permissions, status } = req.body;
    const updatedBy = req.user._id;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.ApiError(400, "Invalid staff ID format");
    }
    const staff = yield staff_model_1.default.findById(id);
    if (!staff) {
        throw new ApiError_1.ApiError(404, "Staff member not found");
    }
    // Ensure staff member belongs to the same hotel as the updater
    if (staff.hotelId.toString() !== req.user.hotelId.toString()) {
        throw new ApiError_1.ApiError(403, "Unauthorized to update staff from different hotel");
    }
    // Update fields
    if (name)
        staff.name = name;
    if (phone)
        staff.phone = phone;
    if (role)
        staff.role = role;
    if (permissions)
        staff.permissions = permissions;
    if (status)
        staff.status = status;
    yield staff.save();
    return res.status(200).json({
        success: true,
        data: staff
    });
}));
// Delete staff member
exports.deleteStaff = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.ApiError(400, "Invalid staff ID format");
    }
    const staff = yield staff_model_1.default.findById(id);
    if (!staff) {
        throw new ApiError_1.ApiError(404, "Staff member not found");
    }
    // Ensure staff member belongs to the same hotel as the deleter
    if (staff.hotelId.toString() !== req.user.hotelId.toString()) {
        throw new ApiError_1.ApiError(403, "Unauthorized to delete staff from different hotel");
    }
    yield staff.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Staff member deleted successfully"
    });
}));
// Refresh token
exports.refreshToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const incomingRefreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError_1.ApiError(401, "Refresh token required");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret');
        const staff = yield staff_model_1.default.findById(decodedToken.id);
        if (!staff || staff.refreshToken !== incomingRefreshToken) {
            throw new ApiError_1.ApiError(401, "Invalid refresh token");
        }
        const { accessToken, refreshToken } = yield generateTokens(staff._id);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            success: true,
            accessToken
        });
    }
    catch (error) {
        throw new ApiError_1.ApiError(401, "Invalid refresh token");
    }
}));
// Logout staff
exports.logoutStaff = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const staff = yield staff_model_1.default.findById(req.user._id);
    if (!staff) {
        throw new ApiError_1.ApiError(401, "Unauthorized request");
    }
    staff.refreshToken = "";
    yield staff.save({ validateBeforeSave: false });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}));
