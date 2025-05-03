"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controller/room.controller");
const router = (0, express_1.Router)();
// Public routes (you might want to protect these with JWT in production)
router.route('/seed-room').post(room_controller_1.seedHotelRooms);
// router.route('/')
//   .get(getRooms)
//   .post(verifyJWT, createRoom)
// router.route('/:id')
//   .get(getRoomById)
//   .patch(verifyJWT, updateRoom)
//   .delete(verifyJWT, deleteRoom);
// router.route('/:id/status')
//   .patch(verifyJWT, updateRoomStatus);
// router.route('/:id/clean')
//   .patch(verifyJWT, markRoomAsCleaned);
// public route
router.route('/')
    .get(room_controller_1.getRooms)
    .post(room_controller_1.createRoom);
router.route('/:id')
    .get(room_controller_1.getRoomById)
    .patch(room_controller_1.updateRoom)
    .delete(room_controller_1.deleteRoom);
router.route('/:id/status')
    .patch(room_controller_1.updateRoomStatus);
router.route('/:id/clean')
    .patch(room_controller_1.markRoomAsCleaned);
exports.default = router;
