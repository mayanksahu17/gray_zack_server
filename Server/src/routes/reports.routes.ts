import express from 'express';
import {
  getDashboardSummary,
  getGuestDemographics,
  getRevenueAnalytics,
  getOccupancyAnalytics
} from '../controller/report.controller';

const router = express.Router();

// Dashboard summary route
router.get('/dashboard/:hotelId', getDashboardSummary);

// Guest demographics route
router.get('/guests/:hotelId', getGuestDemographics);

// Revenue analytics route
router.get('/revenue/:hotelId', getRevenueAnalytics);

// Occupancy analytics route
router.get('/occupancy/:hotelId', getOccupancyAnalytics);

export default router;
