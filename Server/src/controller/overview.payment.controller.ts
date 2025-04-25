import { Request, Response } from 'express'
import Invoice from '../models/invoice.model'
import Booking from '../models/booking.model'
import Guest from '../models/guest.model'

export const getPaymentsData = async (req: Request, res: Response) => {
  try {
    // Get all completed invoices
    const invoices = await Invoice.find({ 'billing.status': { $in: ['paid', 'partial'] } }).lean()

    // Build transactions list
    const transactions = await Promise.all(
      invoices.map(async (invoice) => {
        const guest = await Guest.findById(invoice.guestId).lean()
        return {
          id: invoice.billing.transactionId || invoice._id.toString(),
          guest: guest ? `${guest.personalInfo.firstName} ${guest.personalInfo.lastName}` : 'Unknown',
          amount: `$${invoice.billing.paidAmount.toLocaleString()}`,
          date: invoice.issuedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          method: formatPaymentMethod(invoice.billing.method),
          status: capitalize(invoice.billing.status)
        }
      })
    )

    // Calculate payment method percentages
    const totalCount = invoices.length
    const methodCounts = invoices.reduce((acc, invoice) => {
      const method = formatPaymentMethod(invoice.billing.method)
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const paymentMethods = Object.entries(methodCounts).map(([method, count]) => ({
      method,
      percentage: Math.round((count / totalCount) * 100)
    }))

    // Revenue by booking source
    const bookings = await Booking.find({ 'payment.status': 'paid' }).lean()
    const revenueMap: Record<string, number> = {}

    bookings.forEach((booking) => {
      const source = formatBookingSource(booking.bookingSource)
      revenueMap[source] = (revenueMap[source] || 0) + booking.payment.paidAmount
    })

    const revenueBySource = Object.entries(revenueMap).map(([source, amount]) => ({
      source,
      amount
    }))

    return res.status(200).json({
      transactions,
      paymentMethods,
      revenueBySource
    })
  } catch (err) {
    console.error('Error generating payments data:', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Helper to capitalize status
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

// Normalize method labels
const formatPaymentMethod = (method: string): string => {
  switch (method) {
    case 'credit_card':
      return 'Credit Card'
    case 'cash':
      return 'Cash'
    case 'corporate':
      return 'Corporate'
    case 'zifypay':
      return 'ZifyPay'
    case 'upi':
      return 'UPI'
    case 'online':
      return 'Online'
    default:
      return 'Other'
  }
}

// Normalize booking sources
const formatBookingSource = (source: string): string => {
  switch (source) {
    case 'direct':
      return 'Direct Bookings'
    case 'booking_com':
      return 'Booking.com'
    case 'expedia':
      return 'Expedia'
    case 'airbnb':
      return 'Airbnb'
    default:
      return 'Others'
  }
}
