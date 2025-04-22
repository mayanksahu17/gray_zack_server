import express from 'express';
import {
  getDashboardSummary,
  getOccupancyByRoomType,
  getRevenueByRoomType,
  getDailyOccupancyAndRevenue,
  getBookingSources,
  getRevenueOverTime
} from '../controller/analytics.controller';

const router = express.Router();

// Dashboard summary data
router.get('/:hotelId/dashboard', getDashboardSummary);

// Occupancy by room type
router.get('/:hotelId/occupancy-by-room-type', getOccupancyByRoomType);

// Revenue by room type
router.get('/:hotelId/revenue-by-room-type', getRevenueByRoomType);

// Daily occupancy and revenue
router.get('/:hotelId/daily-metrics', getDailyOccupancyAndRevenue);

// Revenue over time (monthly/weekly trends)
router.get('/:hotelId/revenue-trends', getRevenueOverTime);

// Booking sources
router.get('/:hotelId/booking-sources', getBookingSources);

export default router; 