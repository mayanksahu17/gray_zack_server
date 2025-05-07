import express from 'express';
import { 
  getOccupancyTrend, 
  getRevenueByRoomType, 
  getGuestFeedback, 
  getAvailableReports 
} from '../controller/report.controller';

const router = express.Router();

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
router.get('/occupancy-trend', getOccupancyTrend);

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
router.get('/revenue-by-room-type', getRevenueByRoomType);

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
router.get('/guest-feedback', getGuestFeedback);

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
router.get('/available-reports', getAvailableReports);

export default router;
