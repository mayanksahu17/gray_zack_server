import { Request, Response } from 'express'
import Booking from '../models/booking.model'
import Room from '../models/room.model'
import Invoice from '../models/invoice.model'
import dayjs from 'dayjs'

export const getOccupancyTrend = async (req: Request, res: Response) => {
  try {
    const { year, hotelId } = req.query
    // Default to current year if not specified
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear()
    
    // Initialize result array with all months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const formattedData = months.map((month, index) => ({
      month,
      occupancy: 0
    }))
    
    // For each month, we'll need to calculate occupancy rate
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(targetYear, month, 1)
      const endOfMonth = new Date(targetYear, month + 1, 0, 23, 59, 59, 999)
      const daysInMonth = endOfMonth.getDate()
      
      // Count total rooms available for the hotel
      const filter = hotelId ? { hotelId } : {}
      const totalRooms = await Room.countDocuments(filter)
      
      if (totalRooms === 0) {
        continue // Skip if no rooms exist
      }
      
      // Get all bookings active during this month
      const bookingFilter: any = {
        checkIn: { $lte: endOfMonth },
        $or: [
          { actualCheckOut: { $gte: startOfMonth } },
          { expectedCheckOut: { $gte: startOfMonth }, actualCheckOut: null }
        ],
        status: { $in: ['booked', 'checked_in', 'checked_out'] }
      }
      
      if (hotelId) {
        bookingFilter.hotelId = hotelId
      }
      
      const bookings = await Booking.find(bookingFilter)
      
      // Calculate room-nights booked
      let occupiedRoomNights = 0
      
      bookings.forEach(booking => {
        // Determine overlap with month
        const bookingStart = dayjs(booking.checkIn).isAfter(dayjs(startOfMonth)) 
          ? booking.checkIn 
          : startOfMonth
          
        const bookingEnd = booking.actualCheckOut 
          ? (dayjs(booking.actualCheckOut).isBefore(dayjs(endOfMonth)) 
              ? booking.actualCheckOut 
              : endOfMonth)
          : (dayjs(booking.expectedCheckOut).isBefore(dayjs(endOfMonth)) 
              ? booking.expectedCheckOut 
              : endOfMonth)
        
        // Calculate number of nights (including partial days)
        const nights = Math.ceil(dayjs(bookingEnd).diff(dayjs(bookingStart), 'day', true))
        occupiedRoomNights += Math.max(0, nights) // Ensure no negative nights
      })
      
      // Calculate occupancy rate (room-nights booked / total room-nights available)
      const totalRoomNights = totalRooms * daysInMonth
      const occupancyRate = (occupiedRoomNights / totalRoomNights) * 100
      
      // Add to result
      formattedData[month].occupancy = Math.round(occupancyRate)
    }
    
    res.status(200).json(formattedData)
  } catch (error) {
    console.error("Error calculating occupancy trend:", error)
    res.status(500).json({ message: "Error calculating occupancy trend" })
  }
}

export const getRevenueByRoomType = async (req: Request, res: Response) => {
  try {
    const { year, hotelId } = req.query
    // Default to current year if not specified
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear()
    
    // Set date range for the target year
    const startDate = new Date(targetYear, 0, 1) // January 1st
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999) // December 31st

    // Find all invoices for this period
    const invoiceFilter: any = {
      issuedAt: {
        $gte: startDate,
        $lte: endDate
      }
    }
    
    if (hotelId) {
      invoiceFilter.hotelId = hotelId
    }
    
    // Get all bookings with their associated room IDs
    const bookingsWithRooms = await Booking.find(
      hotelId ? { hotelId } : {}
    ).populate('roomId', 'type')
    
    // Create a map of booking ID to room type
    const bookingToRoomType = new Map()
    bookingsWithRooms.forEach((booking: any) => {
      if (booking.roomId && booking.roomId.type) {
        bookingToRoomType.set(booking._id.toString(), booking.roomId.type)
      }
    })
    
    // Get all invoices
    const invoices = await Invoice.find(invoiceFilter).populate('bookingId')
    
    // Calculate revenue by room type
    const revenueByType = new Map<string, number>()
    
    // Set initial values for standard room types
    const standardRoomTypes = ["Standard", "Deluxe", "Suite", "Executive"]
    standardRoomTypes.forEach(type => revenueByType.set(type, 0))
    
    // Aggregate revenue by room type
    invoices.forEach(invoice => {
      const bookingId = (invoice.bookingId as any)?._id?.toString()
      if (bookingId && bookingToRoomType.has(bookingId)) {
        const roomType = bookingToRoomType.get(bookingId)
        revenueByType.set(
          roomType, 
          (revenueByType.get(roomType) || 0) + invoice.totalAmount
        )
      }
    })
    
    // Format the data for response
    const formattedData = Array.from(revenueByType.entries()).map(([type, revenue]) => ({
      type,
      revenue: Math.round(revenue)
    }))
    
    res.status(200).json(formattedData)
  } catch (error) {
    console.error("Error calculating revenue by room type:", error)
    res.status(500).json({ message: "Error calculating revenue by room type" })
  }
}

export const getGuestFeedback = async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would fetch from a feedback/ratings database
    // For now, we'll return mock data that matches the expected format
    
    const feedbackData = [
      { category: "Cleanliness", rating: 4.5 },
      { category: "Service", rating: 4.7 },
      { category: "Amenities", rating: 4.2 },
      { category: "Food", rating: 4.6 },
      { category: "Value", rating: 4.3 },
      { category: "Location", rating: 4.8 },
    ]
    
    res.status(200).json(feedbackData)
  } catch (error) {
    console.error("Error fetching guest feedback:", error)
    res.status(500).json({ message: "Error fetching guest feedback" })
  }
}

export const getAvailableReports = async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would fetch from a reports database
    // For now, we'll return mock data that matches the expected format
    
    const reportsData = [
      { name: "Monthly Revenue Report", format: "PDF/CSV", lastGenerated: "Jul 1, 2023" },
      { name: "Occupancy Analysis", format: "PDF/CSV", lastGenerated: "Jun 30, 2023" },
      { name: "Staff Performance Report", format: "PDF", lastGenerated: "Jun 15, 2023" },
      { name: "Guest Feedback Summary", format: "PDF", lastGenerated: "Jun 30, 2023" },
      { name: "Inventory Status Report", format: "CSV", lastGenerated: "Jul 5, 2023" },
    ]
    
    res.status(200).json(reportsData)
  } catch (error) {
    console.error("Error fetching available reports:", error)
    res.status(500).json({ message: "Error fetching available reports" })
  }
}
