"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("../controller/analytics.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/v1/analytics/timeline/today:
 *   get:
 *     summary: Get today's hotel timeline data
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Timeline data for today
 */
router.get('/timeline/today', analytics_controller_1.getTodaysTimeline);
/**
 * @swagger
 * /api/v1/analytics/revenue/today:
 *   get:
 *     summary: Get today's hotel revenue
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Revenue for today
 */
router.get('/revenue/today', analytics_controller_1.getTodayRevenue);
/**
 * @swagger
 * /api/v1/analytics/occupancy-rate/today:
 *   get:
 *     summary: Get today's hotel occupancy rate
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Occupancy rate data
 */
router.get('/occupancy-rate/today', analytics_controller_1.getOccupancyRateToday);
/**
 * @swagger
 * /api/v1/analytics/active-reservations:
 *   get:
 *     summary: Get all active reservations
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: List of active reservations
 */
router.get('/active-reservations', analytics_controller_1.getActiveReservations);
/**
 * @swagger
 * /api/v1/analytics/room-service-orders:
 *   get:
 *     summary: Get all room service orders
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: List of room service orders
 */
router.get('/room-service-orders', analytics_controller_1.getRoomServiceOrders);
/**
 * @swagger
 * /api/v1/analytics/revenue/monthly:
 *   get:
 *     summary: Get monthly hotel revenue data
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Monthly revenue report
 */
router.get('/revenue/monthly', analytics_controller_1.getMonthlyRevenue);
/**
 * @swagger
 * /api/v1/analytics/occupancy/monthly:
 *   get:
 *     summary: Get monthly occupancy data
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Monthly occupancy report
 */
router.get('/occupancy/monthly', analytics_controller_1.getMonthlyOccupancy);
/**
 * @swagger
 * /api/v1/analytics/alerts:
 *   get:
 *     summary: Get system-wide hotel alerts
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/alerts', analytics_controller_1.getSystemAlerts);
exports.default = router;
