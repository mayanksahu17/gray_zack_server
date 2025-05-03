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
exports.getDailyBookings = exports.getAvailableRooms = exports.deleteBooking = exports.updateBooking = exports.makePayment = exports.checkInGuest = exports.getBookingsByGuest = exports.getBookingById = exports.createBooking = void 0;
// import Booking from "../models/booking.model";
const room_model_1 = __importDefault(require("../models/room.model"));
const booking_model_1 = __importStar(require("../models/booking.model"));
const guest_model_1 = __importDefault(require("../models/guest.model"));
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const DEFAULT_HOTEL_ID = "67dd8f8173deaf59ece8e7f3"; // Replace with actual hotel ID or config value
const TAX_RATE = 0.125; // 12.5% tax rate
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId = DEFAULT_HOTEL_ID, guestId, roomId, checkIn, expectedCheckOut, adults, children, cardKey, addOns, payment, status } = req.body;
        // Create the booking
        const newBooking = yield booking_model_1.default.create({
            hotelId,
            guestId,
            roomId,
            checkIn,
            expectedCheckOut,
            adults,
            children,
            cardKey,
            addOns,
            payment,
            status: status || booking_model_1.BookingStatus.BOOKED
        });
        // Update room status to "occupied" if checked in
        if (status === booking_model_1.BookingStatus.CHECKED_IN) {
            yield room_model_1.default.findByIdAndUpdate(roomId, { status: "occupied" });
        }
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: newBooking
        });
    }
    catch (err) {
        console.error("Error creating booking:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
            error: err.message
        });
    }
});
exports.createBooking = createBooking;
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield booking_model_1.default.findById(id)
            .populate('guestId', 'firstName lastName email phone')
            .populate('roomId', 'roomNumber type pricePerNight');
        if (!booking) {
            res.status(404).json({
                success: false,
                message: "Booking not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (err) {
        console.error("Error fetching booking:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking",
            error: err.message
        });
    }
});
exports.getBookingById = getBookingById;
const getBookingsByGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone, lastName, reservationNumber } = req.query;
        const query = { hotelId: DEFAULT_HOTEL_ID };
        if (reservationNumber) {
            // If reservation number is provided, search by it directly
            const booking = yield booking_model_1.default.findById(reservationNumber)
                .populate('guestId', 'firstName lastName email phone')
                .populate('roomId', 'roomNumber type pricePerNight');
            if (booking) {
                res.status(200).json({
                    success: true,
                    data: [booking]
                });
                return;
            }
        }
        else {
            // Otherwise search for guest first
            let guestQuery = {};
            if (email)
                guestQuery.email = email;
            if (phone)
                guestQuery.phone = phone;
            if (lastName)
                guestQuery["personalInfo.lastName"] = lastName;
            if (Object.keys(guestQuery).length === 0) {
                res.status(400).json({
                    success: false,
                    message: "At least one search parameter is required"
                });
                return;
            }
            const guests = yield guest_model_1.default.find(guestQuery);
            if (guests.length === 0) {
                res.status(200).json({
                    success: true,
                    data: []
                });
                return;
            }
            const guestIds = guests.map(guest => guest._id);
            query.guestId = { $in: guestIds };
        }
        const bookings = yield booking_model_1.default.find(query)
            .populate('guestId', 'firstName lastName email phone')
            .populate('roomId', 'roomNumber type pricePerNight')
            .sort({ checkIn: -1 });
        res.status(200).json({
            success: true,
            data: bookings
        });
    }
    catch (err) {
        console.error("Error fetching bookings by guest:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: err.message
        });
    }
});
exports.getBookingsByGuest = getBookingsByGuest;
const checkInGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId = DEFAULT_HOTEL_ID, guestId, roomId, checkIn, expectedCheckOut, adults, children, cardKey, addOns, payment, lineItems, totalAmount } = req.body;
        // Check if room is available
        const room = yield room_model_1.default.findById(roomId);
        if (!room) {
            res.status(404).json({
                success: false,
                message: "Room not found"
            });
            return;
        }
        if (room.status === "occupied" || room.status === "maintenance") {
            res.status(400).json({
                success: false,
                message: "Room is not available for check-in"
            });
            return;
        }
        // Create booking
        const booking = yield booking_model_1.default.create({
            hotelId,
            guestId,
            roomId,
            checkIn,
            expectedCheckOut,
            adults,
            children,
            cardKey,
            addOns,
            payment,
            status: booking_model_1.BookingStatus.CHECKED_IN
        });
        // Update room status
        yield room_model_1.default.findByIdAndUpdate(roomId, { status: "occupied" });
        // Create invoice
        const invoice = yield invoice_model_1.default.create({
            bookingId: booking._id,
            guestId,
            roomId,
            lineItems,
            subtotal: totalAmount - (totalAmount * TAX_RATE),
            taxAmount: totalAmount * TAX_RATE,
            totalAmount,
            billing: {
                method: payment.method,
                paidAmount: payment.paidAmount,
                status: "partial",
                transactionId: payment.transactionId,
                paidAt: new Date()
            }
        });
        res.status(201).json({
            success: true,
            message: "Guest checked in successfully",
            data: {
                booking,
                invoice
            }
        });
    }
    catch (err) {
        console.error("Error checking in guest:", err);
        res.status(500).json({
            success: false,
            message: "Failed to check in guest",
            error: err.message
        });
    }
});
exports.checkInGuest = checkInGuest;
const makePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardNumber, expiry, cvv, amount, currency = "USD", userId } = req.body;
        // Validate payment details
        if (!cardNumber || !expiry || !cvv || !amount) {
            res.status(400).json({
                success: false,
                message: "Missing required payment information"
            });
            return;
        }
        // Simple validation
        if (cardNumber.length < 13 || cardNumber.length > 19) {
            res.status(400).json({
                success: false,
                message: "Invalid card number"
            });
            return;
        }
        // In a real app, this would connect to a payment processor
        // For demo purposes, we'll simulate successful payment
        const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        res.status(200).json({
            success: true,
            message: "Payment processed successfully",
            transactionId,
            amount,
            currency,
            last4: cardNumber.slice(-4)
        });
    }
    catch (err) {
        console.error("Error processing payment:", err);
        res.status(500).json({
            success: false,
            message: "Failed to process payment",
            error: err.message
        });
    }
});
exports.makePayment = makePayment;
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Prevent updating critical fields
        delete updateData._id;
        delete updateData.hotelId;
        delete updateData.guestId;
        const updatedBooking = yield booking_model_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (!updatedBooking) {
            res.status(404).json({
                success: false,
                message: "Booking not found"
            });
            return;
        }
        // If status changed to checked out, update room status
        if (updateData.status === booking_model_1.BookingStatus.CHECKED_OUT) {
            yield room_model_1.default.findByIdAndUpdate(updatedBooking.roomId, { status: "available" });
            // Update booking with actual checkout date if not provided
            if (!updateData.actualCheckOut) {
                updatedBooking.actualCheckOut = new Date();
                yield updatedBooking.save();
            }
        }
        res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: updatedBooking
        });
    }
    catch (err) {
        console.error("Error updating booking:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update booking",
            error: err.message
        });
    }
});
exports.updateBooking = updateBooking;
const deleteBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield booking_model_1.default.findById(id);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: "Booking not found"
            });
            return;
        }
        // Only allow deletion of bookings that are not checked in
        if (booking.status === booking_model_1.BookingStatus.CHECKED_IN) {
            res.status(400).json({
                success: false,
                message: "Cannot delete a booking that is already checked in"
            });
            return;
        }
        yield booking_model_1.default.findByIdAndDelete(id);
        // If the booking had a room assigned, ensure it's marked as available
        if (booking.roomId) {
            yield room_model_1.default.findByIdAndUpdate(booking.roomId, { status: "available" });
        }
        res.status(200).json({
            success: true,
            message: "Booking deleted successfully"
        });
    }
    catch (err) {
        console.error("Error deleting booking:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete booking",
            error: err.message
        });
    }
});
exports.deleteBooking = deleteBooking;
const getAvailableRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId = DEFAULT_HOTEL_ID, checkIn, checkOut, adults, children, roomType } = req.query;
        // Basic query to get available rooms
        const query = {
            hotelId: hotelId,
            status: "available"
        };
        // Add room type filter if provided
        if (roomType && roomType !== "all") {
            query.type = roomType;
        }
        // Find all rooms that match the basic criteria
        const rooms = yield room_model_1.default.find(query);
        // If check-in and check-out dates provided, filter further
        if (checkIn && checkOut) {
            // Find bookings that overlap with the requested period
            const overlappingBookings = yield booking_model_1.default.find({
                roomId: { $in: rooms.map(room => room._id) },
                status: { $in: [booking_model_1.BookingStatus.BOOKED, booking_model_1.BookingStatus.CHECKED_IN] },
                $or: [
                    // Case 1: Booking check-in is between requested check-in and check-out
                    {
                        checkIn: {
                            $gte: new Date(checkIn),
                            $lt: new Date(checkOut)
                        }
                    },
                    // Case 2: Booking check-out is between requested check-in and check-out
                    {
                        expectedCheckOut: {
                            $gt: new Date(checkIn),
                            $lte: new Date(checkOut)
                        }
                    },
                    // Case 3: Booking spans the entire requested period
                    {
                        checkIn: { $lte: new Date(checkIn) },
                        expectedCheckOut: { $gte: new Date(checkOut) }
                    }
                ]
            });
            // Filter out rooms that have overlapping bookings
            const unavailableRoomIds = overlappingBookings.map(booking => booking.roomId.toString());
            const availableRooms = rooms.filter(room => !unavailableRoomIds.includes(room._id.toString()));
            res.status(200).json({
                success: true,
                count: availableRooms.length,
                data: availableRooms
            });
            return;
        }
        // If no date filtering, return all available rooms
        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    }
    catch (err) {
        console.error("Error fetching available rooms:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch available rooms",
            error: err.message
        });
    }
});
exports.getAvailableRooms = getAvailableRooms;
/**
 * Get daily check-ins and check-outs for a hotel
 */
const getDailyBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId } = req.params;
        const { startDate, endDate } = req.query;
        // Parse dates or default to today
        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : new Date(start);
        end.setHours(23, 59, 59, 999);
        // Get check-ins for the day
        const checkIns = yield booking_model_1.default.find({
            hotelId,
            checkIn: { $gte: start, $lte: end },
            status: { $in: [booking_model_1.BookingStatus.BOOKED, booking_model_1.BookingStatus.CHECKED_IN] }
        })
            .populate('roomId', 'roomNumber type')
            .populate('guestId', 'firstName lastName');
        // Get check-outs for the day
        const checkOuts = yield booking_model_1.default.find({
            hotelId,
            expectedCheckOut: { $gte: start, $lte: end },
            status: { $in: [booking_model_1.BookingStatus.CHECKED_IN, booking_model_1.BookingStatus.CHECKED_OUT] }
        })
            .populate('roomId', 'roomNumber type')
            .populate('guestId', 'firstName lastName');
        res.status(200).json({
            success: true,
            data: {
                checkIns,
                checkOuts
            }
        });
    }
    catch (err) {
        console.error("Error fetching daily bookings:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch daily bookings",
            error: err.message
        });
    }
});
exports.getDailyBookings = getDailyBookings;
