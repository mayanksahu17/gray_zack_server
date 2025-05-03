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
const lineItemSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: ['room_charge', 'add_on', 'room_service', 'tax', 'other']
    },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 }
}, { _id: false });
const billingSchema = new mongoose_1.Schema({
    method: {
        type: String,
        required: true,
        enum: ['credit_card', 'cash', 'corporate']
    },
    paidAmount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        required: true,
        enum: ['unpaid', 'partial', 'paid', 'refunded'],
        default: 'unpaid'
    },
    transactionId: { type: String, trim: true },
    paidAt: { type: Date },
    refundAmount: { type: Number, min: 0 }
}, { _id: false });
const invoiceSchema = new mongoose_1.Schema({
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    guestId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Guest',
        required: true
    },
    roomId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    lineItems: { type: [lineItemSchema], required: true },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    billing: { type: billingSchema, required: true },
    issuedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    versionKey: false
});
invoiceSchema.index({ bookingId: 1, issuedAt: -1 });
const Invoice = mongoose_1.default.model('Invoice', invoiceSchema);
exports.default = Invoice;
