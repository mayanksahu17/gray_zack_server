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
exports.StaffRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Define enum for staff roles
var StaffRole;
(function (StaffRole) {
    StaffRole["FRONT_DESK"] = "front_desk";
    StaffRole["HOUSEKEEPER"] = "housekeeper";
    StaffRole["RESTAURANT_MANAGER"] = "restaurant_manager";
    StaffRole["SPA_MANAGER"] = "spa_manager";
    StaffRole["HOTEL_OWNER"] = "hotel_owner";
    StaffRole["ADMIN"] = "admin";
})(StaffRole || (exports.StaffRole = StaffRole = {}));
// Define enum for staff status
var StaffStatus;
(function (StaffStatus) {
    StaffStatus["ACTIVE"] = "active";
    StaffStatus["INACTIVE"] = "inactive";
})(StaffStatus || (StaffStatus = {}));
// Staff schema
const staffSchema = new mongoose_1.Schema({
    hotelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Hotel ID is required'],
        ref: 'Hotel' // Reference to Hotel model, not creating a new model
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            'Please provide a valid email address'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^[+]?[\d\s-()]+$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: Object.values(StaffRole),
        default: StaffRole.FRONT_DESK
    },
    permissions: [{
            type: String,
            trim: true
        }],
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Don't include password in query results by default
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: Object.values(StaffStatus),
        default: StaffStatus.ACTIVE
    },
    refreshToken: {
        type: String
    },
    accessToken: {
        type: String
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false // Don't add __v field
});
// Add indexes for efficient querying
staffSchema.index({ email: 1 }, { unique: true });
staffSchema.index({ hotelId: 1, role: 1 });
staffSchema.index({ hotelId: 1, status: 1 });
// Pre-save middleware to hash password before saving
staffSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only hash the password if it has been modified (or is new)
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
// Method to compare entered password with stored hash
staffSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcrypt_1.default.compare(candidatePassword, this.password);
        }
        catch (error) {
            throw new Error('Error comparing passwords');
        }
    });
};
// Change from statics to methods
staffSchema.methods.generateAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET || 'fallback-secret', { expiresIn: '1d' });
};
staffSchema.methods.generateRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret', { expiresIn: '7d' });
};
// Virtual for staff member's access level (numeric representation of role privileges)
staffSchema.virtual('accessLevel').get(function () {
    const accessLevels = {
        [StaffRole.FRONT_DESK]: 1,
        [StaffRole.HOUSEKEEPER]: 1,
        [StaffRole.RESTAURANT_MANAGER]: 2,
        [StaffRole.SPA_MANAGER]: 2,
        [StaffRole.HOTEL_OWNER]: 3,
        [StaffRole.ADMIN]: 4
    };
    return accessLevels[this.role] || 0;
});
// Create and export the model
const Staff = mongoose_1.default.model('Staff', staffSchema);
exports.default = Staff;
