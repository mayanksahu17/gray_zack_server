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
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roomServiceController = __importStar(require("../controller/roomService.controller"));
const router = (0, express_1.Router)();
// Get active bookings for restaurant POS
router.get('/active-bookings/:hotelId', 
// verifyJWT,
roomServiceController.getActiveBookings);
// Create room service charge
router.post('/charge', 
// verifyJWT,
roomServiceController.createRoomServiceCharge);
// Get room service charges for a booking
router.get('/charges/:bookingId', auth_middleware_1.verifyJWT, roomServiceController.getRoomServiceCharges);
// Update room service charge status
router.patch('/charge/:id', auth_middleware_1.verifyJWT, roomServiceController.updateRoomServiceStatus);
// Get pending charges for checkout
router.get('/pending-charges/:bookingId', auth_middleware_1.verifyJWT, roomServiceController.getPendingCharges);
exports.default = router;
