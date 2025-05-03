"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.AdminPermission = exports.AdminStatus = exports.AdminRole = exports.Administrator = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Define enum types for better type safety
var AdminRole;
(function (AdminRole) {
    AdminRole["SYSTEM_ADMIN"] = "system_admin";
    AdminRole["HOTEL_ADMIN"] = "hotel_admin";
    AdminRole["STAFF_ADMIN"] = "staff_admin";
    AdminRole["HOTEL_MANAGER"] = "HOTEL_MANAGER";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
var AdminStatus;
(function (AdminStatus) {
    AdminStatus["ACTIVE"] = "active";
    AdminStatus["INACTIVE"] = "inactive";
})(AdminStatus || (exports.AdminStatus = AdminStatus = {}));
// Define the possible permission types
var AdminPermission;
(function (AdminPermission) {
    AdminPermission["CREATE_HOTEL"] = "create_hotel";
    AdminPermission["MANAGE_SUBSCRIPTIONS"] = "manage_subscriptions";
    AdminPermission["VIEW_ALL_DATA"] = "view_all_data";
    AdminPermission["MANAGE_USERS"] = "manage_users";
    AdminPermission["SYSTEM_SETTINGS"] = "system_settings";
    AdminPermission["AUDIT_LOGS"] = "audit_logs";
    AdminPermission["SUPPORT_TICKETS"] = "support_tickets";
})(AdminPermission || (exports.AdminPermission = AdminPermission = {}));
// Create the Administrator schema
const AdministratorSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Administrator name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
            'Please provide a valid email address'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [
            /^\+\d{1,3}-\d{3}-\d{3}-\d{4}$/,
            'Phone number must be in format: +1-555-987-6543'
        ]
    },
    role: {
        type: String,
        enum: {
            values: Object.values(AdminRole),
            message: '{VALUE} is not a valid role'
        },
        required: [true, 'Administrator role is required']
    },
    permissions: {
        type: [{
                type: String,
                enum: {
                    values: Object.values(AdminPermission),
                    message: '{VALUE} is not a valid permission'
                }
            }],
        validate: {
            validator: function (permissions) {
                // Ensure there are no duplicate permissions
                return new Set(permissions).size === permissions.length;
            },
            message: 'Duplicate permissions are not allowed'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Don't include password in query results by default
    },
    status: {
        type: String,
        enum: {
            values: Object.values(AdminStatus),
            message: '{VALUE} is not a valid status'
        },
        default: AdminStatus.ACTIVE
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true // Once set, cannot be changed
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    refreshToken: {
        type: String
    },
    accessToken: {
        type: String
    }
}, {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password; // Ensure password is never serialized to JSON
            return ret;
        }
    }
});
// Index for improved query performance
AdministratorSchema.index({ email: 1 }, { unique: true });
AdministratorSchema.index({ role: 1 });
AdministratorSchema.index({ status: 1 });
// Pre-save middleware to hash password
AdministratorSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only hash the password if it's modified or new
        if (!this.isModified('password'))
            return next();
        try {
            const salt = yield bcrypt_1.default.genSalt(10);
            this.password = yield bcrypt_1.default.hash(this.password, salt);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Instance method to compare passwords
AdministratorSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcrypt_1.default.compare(candidatePassword, this.password);
        }
        catch (error) {
            throw new Error('Error comparing passwords');
        }
    });
};
// Instance method to check if admin is active
AdministratorSchema.methods.isActive = function () {
    return this.status === AdminStatus.ACTIVE;
};
// Instance method to check if admin has specific permission
AdministratorSchema.methods.hasPermission = function (permission) {
    return this.permissions.includes(permission);
};
// Static method to find admin by email
AdministratorSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() }).select('+password');
};
// Change from statics to methods
AdministratorSchema.methods.generateAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET || 'fallback-secret', { expiresIn: '1d' });
};
AdministratorSchema.methods.generateRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret', { expiresIn: '7d' });
};
// Create and export the model
const Administrator = mongoose_1.default.model('Administrator', AdministratorSchema);
exports.Administrator = Administrator;
