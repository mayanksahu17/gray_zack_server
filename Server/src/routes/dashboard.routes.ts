import express from 'express'
import { getDashboardData } from '../controller/dashboard.data.controller'

const router = express.Router()

router.get('/dashboard', getDashboardData)

export default router 