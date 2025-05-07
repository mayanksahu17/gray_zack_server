import express from 'express'
import { 
  getTodaysTimeline, 
  getTodayRevenue, 
  getOccupancyRateToday, 
  getActiveReservations, 
  getRoomServiceOrders,
  getMonthlyRevenue,
  getMonthlyOccupancy,
  getSystemAlerts
} from '../controller/analytics.controller'

const router = express.Router();

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
router.get('/timeline/today', getTodaysTimeline)

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
router.get('/revenue/today', getTodayRevenue)

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
router.get('/occupancy-rate/today', getOccupancyRateToday)

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
router.get('/active-reservations', getActiveReservations)

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
router.get('/room-service-orders', getRoomServiceOrders)

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
router.get('/revenue/monthly', getMonthlyRevenue)

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
router.get('/occupancy/monthly', getMonthlyOccupancy)

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
router.get('/alerts', getSystemAlerts)

export default router;
