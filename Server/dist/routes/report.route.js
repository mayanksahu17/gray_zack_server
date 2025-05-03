"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_controller_1 = require("../controller/report.controller");
const router = express_1.default.Router();
router.get('/occupancy-trend', report_controller_1.getOccupancyTrend);
router.get('/revenue-by-room-type', report_controller_1.getRevenueByRoomType);
router.get('/guest-feedback', report_controller_1.getGuestFeedback);
router.get('/available-reports', report_controller_1.getAvailableReports);
exports.default = router;
