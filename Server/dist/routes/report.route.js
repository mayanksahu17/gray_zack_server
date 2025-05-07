"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_controller_1 = require("../controller/report.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/v1/reports/occupancy-trend:
 *   get:
 *     summary: Get occupancy trend data over time
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Occupancy trend data retrieved
 */
router.get('/occupancy-trend', report_controller_1.getOccupancyTrend);
/**
 * @swagger
 * /api/v1/reports/revenue-by-room-type:
 *   get:
 *     summary: Get revenue data categorized by room type
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue by room type retrieved
 */
router.get('/revenue-by-room-type', report_controller_1.getRevenueByRoomType);
/**
 * @swagger
 * /api/v1/reports/guest-feedback:
 *   get:
 *     summary: Retrieve guest feedback data
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Guest feedback data retrieved
 */
router.get('/guest-feedback', report_controller_1.getGuestFeedback);
/**
 * @swagger
 * /api/v1/reports/available-reports:
 *   get:
 *     summary: Get list of available report types
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available reports retrieved
 */
router.get('/available-reports', report_controller_1.getAvailableReports);
exports.default = router;
