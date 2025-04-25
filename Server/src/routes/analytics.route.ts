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

const router = express.Router()

router.get('/timeline/today', getTodaysTimeline)
router.get('/revenue/today', getTodayRevenue)
router.get('/occupancy-rate/today', getOccupancyRateToday)
router.get('/active-reservations', getActiveReservations)
router.get('/room-service-orders', getRoomServiceOrders)
router.get('/revenue/monthly', getMonthlyRevenue)
router.get('/occupancy/monthly', getMonthlyOccupancy)
router.get('/alerts', getSystemAlerts)

export default router
