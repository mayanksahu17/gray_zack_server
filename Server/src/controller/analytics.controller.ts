import { Request, Response } from 'express'
import Booking from '../models/booking.model'
import dayjs from 'dayjs'
import Invoice from '../models/invoice.model'
import isBetween from 'dayjs/plugin/isBetween'
// You may need to import Room if not already globally registered
import Room from '../models/room.model'
import RoomService from '../models/RoomService.model'

dayjs.extend(isBetween)

export const getTodaysTimeline = async (req: Request, res: Response) => {
  try {
    const hotelId = req.query.hotelId as string | undefined

    const startOfDay = dayjs().startOf('day').toDate()
    const endOfDay = dayjs().endOf('day').toDate()

    const filter: any = {
      $or: [
        { actualCheckOut: { $gte: startOfDay, $lte: endOfDay } },
        { status: 'checked_in', createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    }

    if (hotelId) {
      filter.hotelId = hotelId
    }

    const bookings = await Booking.find(filter)
      .populate('guestId', 'personalInfo')
      .populate('roomId', 'number')
      .sort({ createdAt: 1, actualCheckOut: 1 })

    const timeline = bookings.flatMap((b) => {
      const guest = (b.guestId as any)?.personalInfo
      const room = (b.roomId as any)?.number || 'Unknown'

      const entries = []

      if (b.status === 'checked_in' && dayjs(b.createdAt).isBetween(startOfDay, endOfDay, null, '[]')) {
        entries.push({
          time: dayjs(b.createdAt).format('hh:mm A'),
          event: 'Check-in',
          room,
          guest: `${guest.firstName} ${guest.lastName}`
        })
      }

      if (b.actualCheckOut && dayjs(b.actualCheckOut).isBetween(startOfDay, endOfDay, null, '[]')) {
        entries.push({
          time: dayjs(b.actualCheckOut).format('hh:mm A'),
          event: 'Check-out',
          room,
          guest: `${guest.firstName} ${guest.lastName}`
        })
      }

      return entries
    })

    timeline.sort((a, b) => dayjs(a.time, 'hh:mm A').unix() - dayjs(b.time, 'hh:mm A').unix())

    res.status(200).json(timeline)
  } catch (error) {
    console.error('[ERROR] Fetching timeline:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getTodayRevenue = async (req: Request, res: Response) => {
  try {
    const todayStart = dayjs().startOf('day').toDate()
    const todayEnd = dayjs().endOf('day').toDate()

    const result = await Invoice.aggregate([
      {
        $match: {
          issuedAt: {
            $gte: todayStart,
            $lte: todayEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ])

    const revenueToday = result[0]?.totalRevenue || 0

    res.status(200).json({
      title: 'Revenue Today',
      value: `$${revenueToday.toLocaleString()}`,
      change: '+12%', // Placeholder, dynamic comparison can be added later
      trend: 'up' // Placeholder too
    })

    console.log(res.status)
  } catch (error) {
    console.error("Error fetching today's revenue:", error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getOccupancyRateToday = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.query;
    const today = new Date();
    
    // Fix the handling of dates to avoid modifying the same date object
    const startDate = dayjs().startOf('day').toDate();
    const endDate = dayjs().endOf('day').toDate();

    // Find active bookings for today
    const filter: any = {
      status: { $in: ['booked', 'checked_in'] },
      checkIn: { $lte: endDate },
      $or: [
        { actualCheckOut: { $gt: startDate } },
        { expectedCheckOut: { $gte: startDate }, actualCheckOut: null }
      ]
    };

    if (hotelId) {
      filter.hotelId = hotelId;
    }

    // Count active bookings
    const activeBookings = await Booking.countDocuments(filter);

    // Get total available rooms
    const rooms = await Room.countDocuments(hotelId ? { hotelId } : {});

    if (rooms === 0) {
      return res.status(200).json({
        title: 'Occupancy Rate',
        value: '0%',
        change: "+5%",
        trend: "up"
      });
    }

    // Calculate occupancy rate
    const occupancyRate = (activeBookings / rooms) * 100;

    res.status(200).json({
      title: 'Occupancy Rate',
      value: `${occupancyRate.toFixed(2)}%`,
      change: "+5%",  
      trend: "up"     
    });
  } catch (error) {
    console.error('Error calculating occupancy rate:', error);
    res.status(500).json({ message: 'Error calculating occupancy rate' });
  }
};

export const getActiveReservations = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.query;
    const today = dayjs();
    const lastWeek = today.subtract(7, 'day');
    
    // Current period
    const filter: any = {
      status: { $in: ['booked', 'checked_in'] }
    };
    
    if (hotelId) {
      filter.hotelId = hotelId;
    }
    
    const activeReservations = await Booking.countDocuments(filter);
    
    // Last week's period for comparison
    const lastWeekFilter = {
      ...filter,
      createdAt: { $lte: lastWeek.endOf('day').toDate() }
    };
    
    const lastWeekReservations = await Booking.countDocuments(lastWeekFilter);
    
    // Calculate change percentage
    let changePercent = 0;
    let trend: 'up' | 'down' | 'flat' = 'flat';
    
    if (lastWeekReservations > 0) {
      changePercent = ((activeReservations - lastWeekReservations) / lastWeekReservations) * 100;
      trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'flat';
    }
    
    res.status(200).json({
      title: 'Active Reservations',
      value: activeReservations.toString(),
      change: `${Math.abs(changePercent).toFixed(0)}%`,
      trend
    });
  } catch (error) {
    console.error('Error fetching active reservations:', error);
    res.status(500).json({ message: 'Error fetching active reservations' });
  }
};

export const getRoomServiceOrders = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.query;
    const today = dayjs();
    const startOfDay = today.startOf('day').toDate();
    const endOfDay = today.endOf('day').toDate();
    const lastWeek = today.subtract(7, 'day');
    const lastWeekStart = lastWeek.startOf('day').toDate();
    const lastWeekEnd = lastWeek.endOf('day').toDate();
    
    // Current day's orders
    const filter: any = {
      createdAt: { 
        $gte: startOfDay,
        $lte: endOfDay
      }
    };
    
    if (hotelId) {
      filter.hotelId = hotelId;
    }
    
    const todayOrders = await RoomService.countDocuments(filter);
    
    // Last week's same day for comparison
    const lastWeekFilter = {
      ...filter,
      createdAt: { 
        $gte: lastWeekStart,
        $lte: lastWeekEnd
      }
    };
    
    const lastWeekOrders = await RoomService.countDocuments(lastWeekFilter);
    
    // Calculate change percentage
    let changePercent = 0;
    let trend: 'up' | 'down' | 'flat' = 'flat';
    
    if (lastWeekOrders > 0) {
      changePercent = ((todayOrders - lastWeekOrders) / lastWeekOrders) * 100;
      trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'flat';
    } else if (todayOrders > 0) {
      // If last week was 0 but today has orders, show 100% increase
      changePercent = 100;
      trend = 'up';
    }
    
    res.status(200).json({
      title: 'Room Service Orders',
      value: todayOrders.toString(),
      change: `${Math.abs(changePercent).toFixed(0)}%`,
      trend
    });
  } catch (error) {
    console.error('Error fetching room service orders:', error);
    res.status(500).json({ message: 'Error fetching room service orders' });
  }
};

export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    // Default to current year if not specified
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    
    // Create startDate and endDate for the target year
    const startDate = new Date(targetYear, 0, 1); // January 1st of target year
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999); // December 31st of target year
    
    // Aggregate monthly revenue
    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          issuedAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: { $month: "$issuedAt" },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Convert the month numbers to month names and format the result
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize with all months at 0 revenue
    const formattedData = months.map((month, index) => ({
      date: month,
      revenue: 0
    }));
    
    // Fill in actual revenue data where it exists
    monthlyRevenue.forEach(item => {
      const monthIndex = item._id - 1; // MongoDB months are 1-indexed
      if (monthIndex >= 0 && monthIndex < 12) {
        formattedData[monthIndex].revenue = item.revenue;
      }
    });
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    res.status(500).json({ message: "Error fetching monthly revenue" });
  }
};

export const getMonthlyOccupancy = async (req: Request, res: Response) => {
  try {
    const { year, hotelId } = req.query;
    // Default to current year if not specified
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    
    // Initialize result array with all months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = months.map((month, index) => ({
      date: month,
      occupancy: 0
    }));
    
    // For each month, we'll need to calculate occupancy rate
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(targetYear, month, 1);
      const endOfMonth = new Date(targetYear, month + 1, 0, 23, 59, 59, 999);
      const daysInMonth = endOfMonth.getDate();
      
      // Count total rooms available for the hotel
      const filter = hotelId ? { hotelId } : {};
      const totalRooms = await Room.countDocuments(filter);
      
      if (totalRooms === 0) {
        continue; // Skip if no rooms exist
      }
      
      // Get all bookings active during this month
      const bookingFilter: any = {
        checkIn: { $lte: endOfMonth },
        $or: [
          { actualCheckOut: { $gte: startOfMonth } },
          { expectedCheckOut: { $gte: startOfMonth }, actualCheckOut: null }
        ],
        status: { $in: ['booked', 'checked_in', 'checked_out'] }
      };
      
      if (hotelId) {
        bookingFilter.hotelId = hotelId;
      }
      
      const bookings = await Booking.find(bookingFilter);
      
      // Calculate room-nights booked
      let occupiedRoomNights = 0;
      
      bookings.forEach(booking => {
        // Determine overlap with month
        const bookingStart = dayjs(booking.checkIn).isAfter(dayjs(startOfMonth)) 
          ? booking.checkIn 
          : startOfMonth;
          
        const bookingEnd = booking.actualCheckOut 
          ? (dayjs(booking.actualCheckOut).isBefore(dayjs(endOfMonth)) 
              ? booking.actualCheckOut 
              : endOfMonth)
          : (dayjs(booking.expectedCheckOut).isBefore(dayjs(endOfMonth)) 
              ? booking.expectedCheckOut 
              : endOfMonth);
        
        // Calculate number of nights (including partial days)
        const nights = Math.ceil(dayjs(bookingEnd).diff(dayjs(bookingStart), 'day', true));
        occupiedRoomNights += Math.max(0, nights); // Ensure no negative nights
      });
      
      // Calculate occupancy rate (room-nights booked / total room-nights available)
      const totalRoomNights = totalRooms * daysInMonth;
      const occupancyRate = (occupiedRoomNights / totalRoomNights) * 100;
      
      // Add to result
      formattedData[month].occupancy = Math.round(occupancyRate);
    }
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error calculating monthly occupancy:", error);
    res.status(500).json({ message: "Error calculating monthly occupancy" });
  }
};

export const getSystemAlerts = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.query;
    const timeframe = parseInt((req.query.timeframe as string) || '24');
    
    // Get a timestamp from X hours ago (default 24 hours)
    const cutoffTime = dayjs().subtract(timeframe, 'hour').toDate();
    
    // Mock data structure - in a real system this would come from a database
    // You would replace this with actual alerts from your database
    const alertTypes = {
      success: [
        { message: "All systems operational", time: dayjs().subtract(1, 'minute').toDate() },
      ],
      warning: [
        { message: "Room maintenance scheduled", time: dayjs().subtract(10, 'minute').toDate() },
        { message: "Low inventory on bathroom supplies", time: dayjs().subtract(3, 'hour').toDate() },
      ],
      error: [
        { message: "Overbooking detected", time: dayjs().subtract(1, 'hour').toDate() },
        { message: "Payment processing system issue", time: dayjs().subtract(5, 'hour').toDate() },
      ]
    };
    
    // Format the alerts
    const allAlerts = [
      ...alertTypes.success.map(alert => ({ ...alert, type: "success" })),
      ...alertTypes.warning.map(alert => ({ ...alert, type: "warning" })),
      ...alertTypes.error.map(alert => ({ ...alert, type: "error" }))
    ];
    
    // Filter by cutoff time
    const recentAlerts = allAlerts
      .filter(alert => alert.time >= cutoffTime)
      .map(alert => ({
        ...alert,
        time: formatAlertTime(alert.time)
      }))
      .sort((a, b) => dayjs(b.time).unix() - dayjs(a.time).unix());
    
    res.status(200).json(recentAlerts);
  } catch (error) {
    console.error("Error fetching system alerts:", error);
    res.status(500).json({ message: "Error fetching system alerts" });
  }
};

// Helper function to format alert times in a user-friendly way
function formatAlertTime(date: Date): string {
  const now = dayjs();
  const alertTime = dayjs(date);
  const diffMinutes = now.diff(alertTime, 'minute');
  
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  
  const diffHours = now.diff(alertTime, 'hour');
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = now.diff(alertTime, 'day');
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}


