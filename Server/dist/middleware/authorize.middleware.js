"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeStaff = exports.authorizeSupportStaff = exports.authorizeSystemAdmin = exports.authorizePermission = void 0;
const ApiError_1 = require("../utills/ApiError");
const administrator_model_1 = require("../models/administrator.model");
const authorizePermission = (allowedRoles = [], requiredPermissions = []) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            // Check if user exists in request (should be set by verifyJWT)
            if (!user) {
                throw new ApiError_1.ApiError(401, "Unauthorized - Please login");
            }
            // Check roles if specified
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                throw new ApiError_1.ApiError(403, "You don't have the required role to perform this action");
            }
            // Check permissions if specified
            if (requiredPermissions.length > 0) {
                const hasRequiredPermission = requiredPermissions.some(permission => { var _a; return (_a = user.permissions) === null || _a === void 0 ? void 0 : _a.includes(permission); });
                if (!hasRequiredPermission) {
                    throw new ApiError_1.ApiError(403, "You don't have the required permissions");
                }
            }
            // If system admin, bypass all other permission checks
            if (user.role === administrator_model_1.AdminRole.SYSTEM_ADMIN) {
                return next();
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizePermission = authorizePermission;
// Optional: Helper function for common authorization patterns
exports.authorizeSystemAdmin = (0, exports.authorizePermission)([administrator_model_1.AdminRole.SYSTEM_ADMIN]);
exports.authorizeSupportStaff = (0, exports.authorizePermission)([administrator_model_1.AdminRole.HOTEL_ADMIN]);
const authorizeStaff = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(401, "Unauthorized access");
            }
            if (!allowedRoles.includes(user.role)) {
                throw new ApiError_1.ApiError(403, "You don't have permission to perform this action");
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizeStaff = authorizeStaff;
