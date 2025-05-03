"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("../controller/analytics.controller");
const router = express_1.default.Router();
router.get('/timeline/today', analytics_controller_1.getTodaysTimeline);
router.get('/revenue/today', analytics_controller_1.getTodayRevenue);
router.get('/occupancy-rate/today', analytics_controller_1.getOccupancyRateToday);
router.get('/active-reservations', analytics_controller_1.getActiveReservations);
router.get('/room-service-orders', analytics_controller_1.getRoomServiceOrders);
router.get('/revenue/monthly', analytics_controller_1.getMonthlyRevenue);
router.get('/occupancy/monthly', analytics_controller_1.getMonthlyOccupancy);
router.get('/alerts', analytics_controller_1.getSystemAlerts);
exports.default = router;
