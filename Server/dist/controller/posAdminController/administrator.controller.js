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
exports.logout = exports.refreshAccessToken = exports.getAdministrators = exports.deleteAdministrator = exports.updateAdministrator = exports.loginAdministrator = exports.createAdministrator = void 0;
const administrator_model_1 = require("../../models/administrator.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = require("../../utills/ApiError");
const asyncHandler_1 = require("../../utills/asyncHandler");
const mongoose_1 = require("mongoose");
// Example payload for reference:
/*
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+1-555-987-6543",
  "role": "system_admin",
  "permissions": ["create_hotel", "manage_users", "system_settings"],
  "password": "SecurePass123!"
}
*/
const generateAccessTokenandRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield administrator_model_1.Administrator.findById(userId);
        if (!user) {
            throw new ApiError_1.ApiError(404, 'User not found');
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.accessToken = accessToken;
        yield user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Something went wrong while generating refresh and access token");
    }
});
exports.createAdministrator = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, role, permissions, password } = req.body;
    // Validate required fields
    if (!name || !email || !phone || !role || !password) {
        throw new ApiError_1.ApiError(400, "All required fields must be provided");
    }
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new ApiError_1.ApiError(400, "Password must contain at least 8 characters, including uppercase, lowercase, number and special character");
    }
    // Check if admin already exists
    const existingAdmin = yield administrator_model_1.Administrator.findByEmail(email);
    if (existingAdmin) {
        throw new ApiError_1.ApiError(409, "Administrator with this email already exists");
    }
    // Validate role
    if (!Object.values(administrator_model_1.AdminRole).includes(role)) {
        throw new ApiError_1.ApiError(400, "Invalid role specified");
    }
    // Validate permissions
    if (permissions) {
        const invalidPermissions = permissions.filter((p) => !Object.values(administrator_model_1.AdminPermission).includes(p));
        if (invalidPermissions.length > 0) {
            throw new ApiError_1.ApiError(400, `Invalid permissions: ${invalidPermissions.join(', ')}`);
        }
    }
    const administrator = yield administrator_model_1.Administrator.create({
        name,
        email,
        phone,
        role,
        permissions: permissions || [],
        password,
        status: administrator_model_1.AdminStatus.ACTIVE
    });
    // Remove sensitive data from response
    const adminResponse = administrator.toJSON();
    return res.status(201).json({
        success: true,
        data: adminResponse
    });
}));
exports.loginAdministrator = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError_1.ApiError(400, "Email and password are required");
    }
    const administrator = yield administrator_model_1.Administrator.findByEmail(email);
    if (!administrator) {
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    }
    if (!administrator.isActive()) {
        throw new ApiError_1.ApiError(403, "Account is inactive");
    }
    const isPasswordValid = yield administrator.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    }
    // Generate tokens
    const { accessToken, refreshToken } = yield generateAccessTokenandRefreshToken(administrator._id);
    // Set cookies
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return res.status(200).json({
        success: true,
        data: {
            _id: administrator._id,
            email: administrator.email,
            name: administrator.name,
            role: administrator.role,
            accessToken
        }
    });
}));
exports.updateAdministrator = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, phone, role, permissions, status } = req.body;
    const administrator = yield administrator_model_1.Administrator.findById(new mongoose_1.Types.ObjectId(id));
    if (!administrator) {
        throw new ApiError_1.ApiError(404, "Administrator not found");
    }
    // Prevent role update if it's the last system admin
    if (role && role !== administrator.role && administrator.role === administrator_model_1.AdminRole.SYSTEM_ADMIN) {
        const systemAdminCount = yield administrator_model_1.Administrator.countDocuments({ role: administrator_model_1.AdminRole.SYSTEM_ADMIN });
        if (systemAdminCount === 1) {
            throw new ApiError_1.ApiError(400, "Cannot change role of the last system administrator");
        }
    }
    // Update fields
    if (name)
        administrator.name = name;
    if (phone)
        administrator.phone = phone;
    if (role)
        administrator.role = role;
    if (permissions)
        administrator.permissions = permissions;
    if (status)
        administrator.status = status;
    yield administrator.save();
    return res.status(200).json({
        success: true,
        data: administrator
    });
}));
exports.deleteAdministrator = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const administrator = yield administrator_model_1.Administrator.findById(id);
    if (!administrator) {
        throw new ApiError_1.ApiError(404, "Administrator not found");
    }
    // Prevent deletion of last system admin
    if (administrator.role === administrator_model_1.AdminRole.SYSTEM_ADMIN) {
        const systemAdminCount = yield administrator_model_1.Administrator.countDocuments({ role: administrator_model_1.AdminRole.SYSTEM_ADMIN });
        if (systemAdminCount === 1) {
            throw new ApiError_1.ApiError(400, "Cannot delete the last system administrator");
        }
    }
    yield administrator.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Administrator deleted successfully"
    });
}));
exports.getAdministrators = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (role)
        query.role = role;
    if (status)
        query.status = status;
    const administrators = yield administrator_model_1.Administrator.find(query)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort({ createdAt: -1 });
    const total = yield administrator_model_1.Administrator.countDocuments(query);
    return res.status(200).json({
        success: true,
        data: administrators,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        }
    });
}));
// Add refresh token endpoint
exports.refreshAccessToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const incomingRefreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError_1.ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret');
        const administrator = yield administrator_model_1.Administrator.findById(decodedToken.id);
        if (!administrator) {
            throw new ApiError_1.ApiError(401, "Invalid refresh token");
        }
        if (incomingRefreshToken !== administrator.refreshToken) {
            throw new ApiError_1.ApiError(401, "Refresh token is expired or used");
        }
        const { accessToken, refreshToken } = yield generateAccessTokenandRefreshToken(administrator._id);
        // Set new cookies
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
// Add logout endpoint
exports.logout = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const administrator = yield administrator_model_1.Administrator.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
    if (!administrator) {
        throw new ApiError_1.ApiError(401, "Unauthorized request");
    }
    administrator.refreshToken = "";
    yield administrator.save({ validateBeforeSave: false });
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}));
