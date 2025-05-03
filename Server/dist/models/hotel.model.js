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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Define enums for subscription related fields
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["BASIC"] = "basic";
    SubscriptionPlan["STANDARD"] = "standard";
    SubscriptionPlan["PREMIUM"] = "premium";
})(SubscriptionPlan || (SubscriptionPlan = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["TRIAL"] = "trial";
})(SubscriptionStatus || (SubscriptionStatus = {}));
var HotelCategory;
(function (HotelCategory) {
    HotelCategory["BUDGET"] = "budget";
    HotelCategory["BUSINESS"] = "business";
    HotelCategory["LUXURY"] = "luxury";
    HotelCategory["RESORT"] = "resort";
})(HotelCategory || (HotelCategory = {}));
// Create schemas for nested objects
const addressSchema = new mongoose_1.Schema({
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false } // Prevent Mongoose from creating _id for subdocuments
);
const contactInfoSchema = new mongoose_1.Schema({
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[+]?[\d\s-()]+$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    website: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });
const ownerSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Reference to User model, not creating a new model
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[+]?[\d\s-()]+$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    }
}, { _id: false });
const subscriptionSchema = new mongoose_1.Schema({
    plan: {
        type: String,
        required: true,
        enum: Object.values(SubscriptionPlan),
        default: SubscriptionPlan.BASIC
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.TRIAL
    }
}, { _id: false });
// Main hotel schema
const hotelSchema = new mongoose_1.Schema({
    adminId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Administrator',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
        type: String,
        enum: Object.values(HotelCategory),
        required: true
    },
    starRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    images: [String],
    amenities: [String],
    contactInfo: {
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        website: String
    },
    policies: {
        checkIn: {
            type: String,
            required: true
        },
        checkOut: {
            type: String,
            required: true
        },
        cancellation: {
            type: String,
            required: true
        }
    },
    subscriptionPlan: {
        planId: String,
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active'
        }
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false // Don't add __v field
});
// Add indexes for efficient querying
hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ adminId: 1 });
hotelSchema.index({ category: 1 });
hotelSchema.index({ 'subscriptionPlan.status': 1 });
// Method to check if subscription is active
hotelSchema.methods.isSubscriptionActive = function () {
    const now = new Date();
    return (this.subscriptionPlan.status === SubscriptionStatus.ACTIVE &&
        now >= this.subscriptionPlan.startDate &&
        now < this.subscriptionPlan.endDate);
};
// Method to calculate days until subscription expiration
hotelSchema.methods.daysUntilExpiration = function () {
    const now = new Date();
    const endDate = new Date(this.subscriptionPlan.endDate);
    if (now > endDate)
        return 0;
    const differenceInTime = endDate.getTime() - now.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
};
// Pre-save middleware to update subscription status based on dates
hotelSchema.pre('save', function (next) {
    const now = new Date();
    const sub = this.subscriptionPlan;
    // Update subscription status based on dates
    if (now < sub.startDate) {
        // Future subscription
        if (sub.status !== SubscriptionStatus.TRIAL) {
            sub.status = SubscriptionStatus.TRIAL;
        }
    }
    else if (now > sub.endDate) {
        // Expired subscription
        sub.status = SubscriptionStatus.EXPIRED;
    }
    else {
        // Active subscription
        if (sub.status !== SubscriptionStatus.ACTIVE) {
            sub.status = SubscriptionStatus.ACTIVE;
        }
    }
    next();
});
// Create and export the model
const Hotel = mongoose_1.default.model('Hotel', hotelSchema);
exports.default = Hotel;
