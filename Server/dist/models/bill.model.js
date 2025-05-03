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
exports.ServiceType = exports.PaymentStatus = exports.PaymentMethod = exports.BillStatus = exports.Bill = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define enum types for better type safety
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["DEBIT_CARD"] = "debit_card";
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var BillStatus;
(function (BillStatus) {
    BillStatus["PENDING"] = "pending";
    BillStatus["PAID"] = "paid";
    BillStatus["PARTIALLY_PAID"] = "partially_paid";
    BillStatus["CANCELLED"] = "cancelled";
})(BillStatus || (exports.BillStatus = BillStatus = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["RESTAURANT"] = "restaurant";
    ServiceType["ROOM_SERVICE"] = "room_service";
    ServiceType["SPA"] = "spa";
    ServiceType["LAUNDRY"] = "laundry";
    ServiceType["MINIBAR"] = "minibar";
    ServiceType["OTHER"] = "other";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
// Schema definitions for nested objects
const StayDetailsSchema = new mongoose_1.Schema({
    checkIn: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkOut: {
        type: Date,
        required: [true, 'Check-out date is required'],
        validate: {
            validator: function (checkOut) {
                return checkOut > this.checkIn;
            },
            message: 'Check-out date must be after check-in date'
        }
    },
    nights: {
        type: Number,
        required: [true, 'Number of nights is required'],
        min: [1, 'Minimum stay is 1 night'],
        validate: {
            validator: function (nights) {
                if (!this.checkIn || !this.checkOut)
                    return true;
                const checkInDate = new Date(this.checkIn);
                const checkOutDate = new Date(this.checkOut);
                const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return nights === diffDays;
            },
            message: 'Number of nights does not match the difference between check-in and check-out dates'
        }
    },
    roomCharges: {
        type: Number,
        required: [true, 'Room charges are required'],
        min: [0, 'Room charges cannot be negative']
    }
}, { _id: false });
const OrderChargeSchema = new mongoose_1.Schema({
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Order ID is required'],
        ref: 'Order'
    },
    serviceType: {
        type: String,
        enum: {
            values: Object.values(ServiceType),
            message: '{VALUE} is not a valid service type'
        },
        required: [true, 'Service type is required']
    },
    serviceName: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        minlength: [2, 'Service name must be at least 2 characters long'],
        maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        validate: {
            validator: function (date) {
                const parentPath = this.parent();
                if (!parentPath || !parentPath.parent)
                    return true;
                const parent = parentPath.parent();
                if (!parent.stayDetails)
                    return true;
                return date >= parent.stayDetails.checkIn && date <= parent.stayDetails.checkOut;
            },
            message: 'Order date must be within the stay period'
        }
    }
}, { _id: true });
const ExtraSchema = new mongoose_1.Schema({
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [2, 'Description must be at least 2 characters long'],
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    }
}, { _id: true });
const PaymentSchema = new mongoose_1.Schema({
    method: {
        type: String,
        enum: {
            values: Object.values(PaymentMethod),
            message: '{VALUE} is not a valid payment method'
        },
        required: [true, 'Payment method is required']
    },
    cardType: {
        type: String,
        trim: true,
        validate: {
            validator: function () {
                const isCreditOrDebitCard = this.method === PaymentMethod.CREDIT_CARD ||
                    this.method === PaymentMethod.DEBIT_CARD;
                return !isCreditOrDebitCard || (isCreditOrDebitCard && this.cardType);
            },
            message: 'Card type is required for credit/debit card payments'
        }
    },
    lastFourDigits: {
        type: String,
        trim: true,
        validate: [
            {
                validator: function (digits) {
                    if (this.method !== PaymentMethod.CREDIT_CARD && this.method !== PaymentMethod.DEBIT_CARD) {
                        return true;
                    }
                    return digits !== undefined;
                },
                message: 'Last four digits are required for card payments'
            },
            {
                validator: function (digits) {
                    if (this.method !== PaymentMethod.CREDIT_CARD && this.method !== PaymentMethod.DEBIT_CARD) {
                        return true;
                    }
                    return /^\d{4}$/.test(digits);
                },
                message: 'Last four digits must be exactly 4 numeric characters'
            }
        ]
    },
    transactionId: {
        type: String,
        trim: true,
        validate: {
            validator: function () {
                return this.method === PaymentMethod.CASH || this.transactionId;
            },
            message: 'Transaction ID is required for non-cash payments'
        }
    },
    status: {
        type: String,
        enum: {
            values: Object.values(PaymentStatus),
            message: '{VALUE} is not a valid payment status'
        },
        required: [true, 'Payment status is required']
    },
    date: {
        type: Date,
        required: [true, 'Payment date is required']
    }
}, { _id: false });
// Main Bill Schema
const BillSchema = new mongoose_1.Schema({
    hotelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Hotel ID is required'],
        ref: 'Hotel'
    },
    guestId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Guest ID is required'],
        ref: 'Guest'
    },
    roomId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Room ID is required'],
        ref: 'Room'
    },
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        trim: true
    },
    stayDetails: {
        type: StayDetailsSchema,
        required: [true, 'Stay details are required']
    },
    orderCharges: {
        type: [OrderChargeSchema],
        default: []
    },
    extras: {
        type: [ExtraSchema],
        default: []
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative'],
        validate: {
            validator: function (subtotal) {
                const calculatedSubtotal = this.stayDetails.roomCharges +
                    this.orderCharges.reduce((sum, order) => sum + order.amount, 0) +
                    this.extras.reduce((sum, extra) => sum + extra.amount, 0);
                // Allow for minor floating point differences (e.g., 1364.34 vs 1364.339999999)
                return Math.abs(calculatedSubtotal - subtotal) < 0.01;
            },
            message: 'Subtotal does not match the sum of room charges, order charges, and extras'
        }
    },
    tax: {
        type: Number,
        required: [true, 'Tax is required'],
        min: [0, 'Tax cannot be negative']
    },
    grandTotal: {
        type: Number,
        required: [true, 'Grand total is required'],
        min: [0, 'Grand total cannot be negative'],
        validate: {
            validator: function (grandTotal) {
                const calculatedGrandTotal = this.subtotal + this.tax;
                // Allow for minor floating point differences
                return Math.abs(calculatedGrandTotal - grandTotal) < 0.01;
            },
            message: 'Grand total does not match the sum of subtotal and tax'
        }
    },
    payment: {
        type: PaymentSchema,
        required: [true, 'Payment details are required']
    },
    status: {
        type: String,
        enum: {
            values: Object.values(BillStatus),
            message: '{VALUE} is not a valid bill status'
        },
        required: [true, 'Bill status is required'],
        validate: {
            validator: function (status) {
                if (status === BillStatus.PAID && this.payment.status !== PaymentStatus.COMPLETED) {
                    return false;
                }
                if (status === BillStatus.CANCELLED && this.payment.status === PaymentStatus.COMPLETED) {
                    return false;
                }
                return true;
            },
            message: 'Bill status is inconsistent with payment status'
        }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Employee ID is required'],
        ref: 'Employee'
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            delete ret.__v;
            return ret;
        }
    }
});
// Indexes for performance
BillSchema.index({ hotelId: 1, createdAt: -1 });
BillSchema.index({ guestId: 1 });
BillSchema.index({ 'payment.status': 1 });
BillSchema.index({ status: 1 });
BillSchema.index({ 'stayDetails.checkIn': 1, 'stayDetails.checkOut': 1 });
// Instance methods
BillSchema.methods.calculateTotals = function () {
    // Calculate subtotal
    const roomCharges = this.stayDetails.roomCharges || 0;
    const orderTotal = this.orderCharges.reduce((sum, order) => sum + order.amount, 0);
    const extrasTotal = this.extras.reduce((sum, extra) => sum + extra.amount, 0);
    this.subtotal = Number((roomCharges + orderTotal + extrasTotal).toFixed(2));
    // Calculate tax (assuming tax is 10% of subtotal for this example)
    this.tax = Number((this.subtotal * 0.1).toFixed(2));
    // Calculate grand total
    this.grandTotal = Number((this.subtotal + this.tax).toFixed(2));
};
BillSchema.methods.isPaid = function () {
    return this.status === BillStatus.PAID;
};
BillSchema.methods.getDuration = function () {
    return this.stayDetails.nights;
};
// Pre-save hook to ensure calculations are correct
BillSchema.pre('save', function (next) {
    // Recalculate totals before saving
    this.calculateTotals();
    // Update status based on payment status
    if (this.payment.status === PaymentStatus.COMPLETED) {
        this.status = BillStatus.PAID;
    }
    else if (this.payment.status === PaymentStatus.PENDING) {
        this.status = BillStatus.PENDING;
    }
    next();
});
// Virtual properties
BillSchema.virtual('durationDays').get(function () {
    return this.stayDetails.nights;
});
BillSchema.virtual('averageDailyRate').get(function () {
    if (!this.stayDetails.nights || this.stayDetails.nights === 0)
        return 0;
    return Number((this.stayDetails.roomCharges / this.stayDetails.nights).toFixed(2));
});
// Create and export the model
const Bill = mongoose_1.default.model('Bill', BillSchema);
exports.Bill = Bill;
