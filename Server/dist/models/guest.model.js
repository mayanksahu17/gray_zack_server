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
const addressSchema = new mongoose_1.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: false });
const personalInfoSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
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
            validator: (v) => /^[+]?[\d\s\-()]+$/.test(v),
            message: (props) => `${props.value} is not a valid phone number!`
        }
    },
    address: { type: String, required: true },
    idType: {
        type: String,
        required: true,
        enum: ['passport', 'driver_license', 'national_id']
    },
    idNumber: { type: String, required: true, trim: true },
    nationality: { type: String, trim: true },
    reservationNumber: { type: String, trim: true }
}, { _id: false });
const guestSchema = new mongoose_1.Schema({
    hotelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Hotel'
    },
    personalInfo: {
        type: personalInfoSchema,
        required: true
    },
    preferences: [{ type: String, trim: true }],
    isCorporateGuest: { type: Boolean, default: false },
    companyName: { type: String, trim: true },
    stays: {
        type: [
            {
                id: String,
                checkIn: String,
                checkOut: String,
                nights: Number,
                room: String,
                roomType: String,
                totalSpent: Number,
                tags: [String]
            }
        ],
        default: []
    },
    billing: {
        type: [
            {
                id: String,
                description: String,
                category: String,
                date: String,
                paymentMethod: String,
                amount: Number
            }
        ],
        default: []
    },
    notes: {
        type: [
            {
                id: String,
                title: String,
                content: String,
                date: String,
                staff: String
            }
        ],
        default: []
    }
}, {
    timestamps: true,
    versionKey: false
});
guestSchema.index({ hotelId: 1, 'personalInfo.email': 1 });
guestSchema.index({ 'personalInfo.phone': 1 });
guestSchema.index({ 'personalInfo.idNumber': 1 });
guestSchema.virtual('fullName').get(function () {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});
const Guest = mongoose_1.default.model('Guest', guestSchema);
exports.default = Guest;
