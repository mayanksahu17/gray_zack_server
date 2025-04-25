import { Router } from 'express'
import { getPaymentsData } from '../controller/overview.payment.controller'

const router = Router()

router.get('/dashboard/payments-data', getPaymentsData)

export default router