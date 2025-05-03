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
const roomServiceSchema = new mongoose_1.Schema({
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Booking'
    },
    roomId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Room'
    },
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    },
    hotelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Hotel'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'charged', 'cancelled'],
        default: 'pending'
    },
    chargedToRoom: {
        type: Boolean,
        default: false
    },
    addedToInvoice: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});
roomServiceSchema.index({ bookingId: 1, status: 1 });
roomServiceSchema.index({ roomId: 1, createdAt: 1 });
const RoomService = mongoose_1.default.model('RoomService', roomServiceSchema);
exports.default = RoomService;
