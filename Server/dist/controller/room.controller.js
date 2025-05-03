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
exports.seedHotelRooms = exports.markRoomAsCleaned = exports.updateRoomStatus = exports.deleteRoom = exports.updateRoom = exports.getRoomById = exports.getRooms = exports.createRoom = void 0;
const room_model_1 = __importDefault(require("../models/room.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const seedrooms_1 = require("../utills/seedrooms");
const mongodb_1 = require("mongodb");
/**
 * Create a new room
 * @route POST /api/v1/rooms
 * @access Public
 */
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId, roomNumber, type, floor, beds, capacity, amenities, pricePerNight, status, lastCleaned } = req.body;
        // Check if room with same number already exists in the hotel
        const existingRoom = yield room_model_1.default.findOne({ hotelId, roomNumber });
        if (existingRoom) {
            return res.status(409).json({
                success: false,
                message: `Room ${roomNumber} already exists in this hotel`
            });
        }
        // Create new room
        const room = yield room_model_1.default.create({
            hotelId,
            roomNumber,
            type,
            floor,
            beds,
            capacity,
            amenities,
            pricePerNight,
            status,
            lastCleaned: lastCleaned || new Date()
        });
        res.status(201).json({
            success: true,
            message: "Room created successfully",
            data: room
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map((err) => err.message).join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to create room",
            error: error.message
        });
    }
});
exports.createRoom = createRoom;
/**
 * Get rooms with pagination and filters
 * @route GET /api/v1/rooms
 * @access Public
 */
const getRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId, type, status, floor, minPrice, maxPrice, capacity, page = 1, limit = 10 } = req.query;
        // Build query
        const queryObject = {};
        // Add filters if provided
        if (hotelId)
            queryObject.hotelId = new mongoose_1.default.Types.ObjectId(hotelId);
        if (type)
            queryObject.type = type;
        if (status)
            queryObject.status = status;
        if (floor)
            queryObject.floor = Number(floor);
        if (capacity)
            queryObject.capacity = { $gte: Number(capacity) };
        // Price range filter
        if (minPrice || maxPrice) {
            queryObject.pricePerNight = {};
            if (minPrice)
                queryObject.pricePerNight.$gte = Number(minPrice);
            if (maxPrice)
                queryObject.pricePerNight.$lte = Number(maxPrice);
        }
        // Calculate pagination values
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.max(Number(limit), 1);
        const skip = (pageNum - 1) * limitNum;
        // Execute query with pagination
        const rooms = yield room_model_1.default.find(queryObject)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        // Get total count for pagination info
        const totalRooms = yield room_model_1.default.countDocuments(queryObject);
        const totalPages = Math.ceil(totalRooms / limitNum);
        res.status(200).json({
            success: true,
            count: rooms.length,
            totalRooms,
            totalPages,
            currentPage: pageNum,
            data: rooms
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch rooms",
            error: error.message
        });
    }
});
exports.getRooms = getRooms;
/**
 * Get a single room by ID
 * @route GET /api/v1/rooms/:id
 * @access Public
 */
const getRoomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room ID format"
            });
        }
        const room = yield room_model_1.default.findById(id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }
        res.status(200).json({
            success: true,
            data: room
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch room",
            error: error.message
        });
    }
});
exports.getRoomById = getRoomById;
/**
 * Update a room
 * @route PATCH /api/v1/rooms/:id
 * @access Public
 */
const updateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room ID format"
            });
        }
        // If updating room number, check for duplicates
        if (updates.roomNumber && updates.hotelId) {
            const existingRoom = yield room_model_1.default.findOne({
                hotelId: updates.hotelId,
                roomNumber: updates.roomNumber,
                _id: { $ne: id }
            });
            if (existingRoom) {
                return res.status(409).json({
                    success: false,
                    message: `Room ${updates.roomNumber} already exists in this hotel`
                });
            }
        }
        // Find and update room
        const room = yield room_model_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Room updated successfully",
            data: room
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map((err) => err.message).join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to update room",
            error: error.message
        });
    }
});
exports.updateRoom = updateRoom;
/**
 * Delete a room
 * @route DELETE /api/v1/rooms/:id
 * @access Public
 */
const deleteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room ID format"
            });
        }
        const room = yield room_model_1.default.findByIdAndDelete(id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Room deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete room",
            error: error.message
        });
    }
});
exports.deleteRoom = deleteRoom;
/**
 * Update room status
 * @route PATCH /api/v1/rooms/:id/status
 * @access Public
 */
const updateRoomStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room ID format"
            });
        }
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }
        const room = yield room_model_1.default.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Room status updated successfully",
            data: room
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update room status",
            error: error.message
        });
    }
});
exports.updateRoomStatus = updateRoomStatus;
/**
 * Mark room as cleaned
 * @route PATCH /api/v1/rooms/:id/clean
 * @access Public
 */
const markRoomAsCleaned = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room ID format"
            });
        }
        const room = yield room_model_1.default.findByIdAndUpdate(id, {
            $set: {
                lastCleaned: new Date(),
                status: 'available' // Assuming room becomes available after cleaning
            }
        }, { new: true });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Room marked as cleaned",
            data: room
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to mark room as cleaned",
            error: error.message
        });
    }
});
exports.markRoomAsCleaned = markRoomAsCleaned;
/**
 * Seed multiple rooms for a specific hotel
 * @param req Request object containing hotelId and count
 * @param res Response object
 */
const seedHotelRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId, count } = req.body;
        if (!hotelId) {
            return res.status(400).json({
                success: false,
                message: 'Hotel ID is required'
            });
        }
        // Create rooms for this specific hotel
        const hotelObjectId = mongodb_1.ObjectId.createFromHexString(hotelId);
        const roomsToCreate = (0, seedrooms_1.createHotelRooms)(hotelObjectId, parseInt(count));
        // Insert rooms
        const results = yield Promise.all(roomsToCreate.map((roomData) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Check if room already exists
                const existingRoom = yield room_model_1.default.findOne({
                    hotelId: roomData.hotelId,
                    roomNumber: roomData.roomNumber
                });
                if (existingRoom) {
                    return {
                        success: false,
                        roomNumber: roomData.roomNumber,
                        message: 'Room already exists'
                    };
                }
                // Create new room
                const room = yield room_model_1.default.create(roomData);
                return {
                    success: true,
                    roomNumber: room.roomNumber,
                    id: room._id
                };
            }
            catch (error) {
                return {
                    success: false,
                    roomNumber: roomData.roomNumber,
                    error: error.message
                };
            }
        })));
        // Count successes and failures
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        return res.status(200).json({
            success: true,
            message: `Seeded ${successful} rooms for hotel ${hotelId} (${failed} failed)`,
            results
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to seed hotel rooms',
            error: error.message
        });
    }
});
exports.seedHotelRooms = seedHotelRooms;
