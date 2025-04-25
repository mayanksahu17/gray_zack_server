import express from 'express'
import { 
  getOccupancyTrend, 
  getRevenueByRoomType, 
  getGuestFeedback, 
  getAvailableReports 
} from '../controller/report.controller'

const router = express.Router()

router.get('/occupancy-trend', getOccupancyTrend)
router.get('/revenue-by-room-type', getRevenueByRoomType)
router.get('/guest-feedback', getGuestFeedback)
router.get('/available-reports', getAvailableReports)

export default router
