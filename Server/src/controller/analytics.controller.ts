import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Room from '../models/room.model';
import Booking, { BookingStatus } from '../models/booking.model';
import Invoice from '../models/invoice.model';

// Get dashboard summary data
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate dates
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate as string) : new Date();

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ message: 'Invalid hotel ID format' });
    }

    // Get occupancy data
    const totalRooms = await Room.countDocuments({ hotelId });
    const occupiedRooms = await Room.countDocuments({ 
      hotelId, 
      status: 'occupied' 
    });
    const occupancyRate = totalRooms ? (occupiedRooms / totalRooms) * 100 : 0;

    // Get revenue data
    const bookings = await Booking.find({
      hotelId,
      $or: [
        { status: BookingStatus.CHECKED_IN },
        { status: BookingStatus.CHECKED_OUT },
        {
          status: BookingStatus.BOOKED,
          checkIn: { $gte: start, $lte: end }
        }
      ]
    }).populate('roomId');

    // Calculate ADR (Average Daily Rate)
    let totalRevenue = 0;
    let roomNights = 0;

    bookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = booking.actualCheckOut || booking.expectedCheckOut;
      
      // Calculate duration in days
      const durationMs = checkOut.getTime() - checkIn.getTime();
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      
      roomNights += durationDays;
      totalRevenue += booking.payment.totalAmount;
    });

    const adr = roomNights ? totalRevenue / roomNights : 0;
    
    // Calculate RevPAR (Revenue Per Available Room)
    const revpar = totalRooms ? totalRevenue / totalRooms : 0;

    // Get today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayInvoices = await Invoice.find({
      issuedAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = todayInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    return res.status(200).json({
      occupancyRate,
      totalRooms,
      occupiedRooms,
      adr,
      revpar,
      totalRevenue,
      todayRevenue
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
};

// Get occupancy breakdown by room type
export const getOccupancyByRoomType = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    
    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ message: 'Invalid hotel ID format' });
    }

    const roomTypes = await Room.aggregate([
      { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },
      { $group: {
        _id: '$type',
        totalRooms: { $sum: 1 },
        occupiedRooms: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] 
          }
        }
      }},
      { $project: {
        roomType: '$_id',
        totalRooms: 1,
        occupiedRooms: 1,
        occupancyRate: { 
          $multiply: [
            { $divide: ['$occupiedRooms', '$totalRooms'] },
            100
          ]
        }
      }},
      { $sort: { roomType: 1 } }
    ]);

    return res.status(200).json(roomTypes);
  } catch (error) {
    console.error('Error fetching occupancy by room type:', error);
    return res.status(500).json({ message: 'Failed to fetch occupancy data' });
  }
};

// Get revenue breakdown by room type
export const getRevenueByRoomType = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate dates
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ message: 'Invalid hotel ID format' });
    }

    // Get all rooms for this hotel
    const rooms = await Room.find({ hotelId });
    
    // Create map to store revenue by room type
    const revenueByType: {
      [key: string]: {
        roomType: string;
        roomRevenue: number;
        fbRevenue: number;
        otherRevenue: number;
        totalRevenue: number;
        count: number;
      }
    } = {};

    // Initialize with all room types
    const uniqueRoomTypes = [...new Set(rooms.map(room => room.type))];
    uniqueRoomTypes.forEach(type => {
      revenueByType[type] = {
        roomType: type,
        roomRevenue: 0,
        fbRevenue: 0,
        otherRevenue: 0,
        totalRevenue: 0,
        count: 0
      };
    });

    // Process revenue from room.revenueHistory
    rooms.forEach(room => {
      // Filter revenue history entries within date range
      const relevantHistory = room.revenueHistory.filter(entry => {
        return entry.date >= start && entry.date <= end;
      });

      if (relevantHistory.length > 0) {
        const roomType = room.type;
        const typeData = revenueByType[roomType];
        
        // Assume 60% of additionalRevenue is F&B and 40% is other
        const fbRevenuePercent = 0.6;
        const otherRevenuePercent = 0.4;
        
        // Sum up revenue from this room
        relevantHistory.forEach(entry => {
          typeData.roomRevenue += entry.roomRevenue;
          typeData.fbRevenue += entry.additionalRevenue * fbRevenuePercent;
          typeData.otherRevenue += entry.additionalRevenue * otherRevenuePercent;
          typeData.totalRevenue += entry.roomRevenue + entry.additionalRevenue;
          typeData.count += entry.occupiedNights;
        });
      }
    });

    // Convert the map to an array for response
    const result = Object.values(revenueByType).filter(item => item.totalRevenue > 0);

    // If no revenue data from revenueHistory, fall back to invoice-based calculation
    if (result.length === 0) {
      const revenueByRoomType = await Booking.aggregate([
        { 
          $match: { 
            hotelId: new mongoose.Types.ObjectId(hotelId),
            checkIn: { $gte: start, $lte: end },
            status: { $in: [BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] }
          } 
        },
        {
          $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'room'
          }
        },
        { $unwind: '$room' },
        {
          $lookup: {
            from: 'invoices',
            localField: '_id',
            foreignField: 'bookingId',
            as: 'invoice'
          }
        },
        { 
          $unwind: { 
            path: '$invoice',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$room.type',
            roomRevenue: {
              $sum: {
                $reduce: {
                  input: {
                    $filter: {
                      input: '$invoice.lineItems',
                      as: 'item',
                      cond: { $eq: ['$$item.type', 'room_charge'] }
                    }
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.amount'] }
                }
              }
            },
            fbRevenue: {
              $sum: {
                $reduce: {
                  input: {
                    $filter: {
                      input: '$invoice.lineItems',
                      as: 'item',
                      cond: { $eq: ['$$item.type', 'room_service'] }
                    }
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.amount'] }
                }
              }
            },
            otherRevenue: {
              $sum: {
                $reduce: {
                  input: {
                    $filter: {
                      input: '$invoice.lineItems',
                      as: 'item',
                      cond: { 
                        $and: [
                          { $ne: ['$$item.type', 'room_charge'] },
                          { $ne: ['$$item.type', 'room_service'] },
                          { $ne: ['$$item.type', 'tax'] }
                        ]
                      }
                    }
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.amount'] }
                }
              }
            },
            totalRevenue: { $sum: '$invoice.totalAmount' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            roomType: '$_id',
            roomRevenue: 1,
            fbRevenue: 1,
            otherRevenue: 1,
            totalRevenue: 1,
            count: 1
          }
        },
        { $sort: { roomType: 1 } }
      ]);

      return res.status(200).json(revenueByRoomType);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching revenue by room type:', error);
    return res.status(500).json({ message: 'Failed to fetch revenue data' });
  }
};

// Get daily occupancy and revenue
export const getDailyOccupancyAndRevenue = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate dates
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ message: 'Invalid hotel ID format' });
    }

    // Helper function to generate date range
    const getDates = (startDate: Date, endDate: Date) => {
      const dates = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dates;
    };

    const dateRange = getDates(start, end);
    const totalRooms = await Room.countDocuments({ hotelId });

    // Get all rooms for this hotel
    const rooms = await Room.find({ hotelId });

    // Prepare result container
    const result = await Promise.all(dateRange.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Get occupancy for the day
      const occupiedRoomsCount = await Booking.countDocuments({
        hotelId,
        checkIn: { $lte: date },
        $or: [
          { actualCheckOut: { $gte: nextDay } },
          { expectedCheckOut: { $gte: nextDay }, actualCheckOut: null }
        ],
        status: { $in: [BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] }
      });
      
      const occupancyRate = totalRooms ? (occupiedRoomsCount / totalRooms) * 100 : 0;
      
      // Format date for comparison
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      
      // Calculate revenue from room.revenueHistory
      let totalRoomRevenue = 0;
      let totalAdditionalRevenue = 0;
      let totalOccupiedNights = 0;
      
      // Aggregate revenue data from each room's revenue history
      rooms.forEach(room => {
        const revenueEntry = room.revenueHistory.find(
          entry => entry.date.getTime() === normalizedDate.getTime()
        );
        
        if (revenueEntry) {
          totalRoomRevenue += revenueEntry.roomRevenue;
          totalAdditionalRevenue += revenueEntry.additionalRevenue;
          totalOccupiedNights += revenueEntry.occupiedNights;
        }
      });
      
      const totalRevenue = totalRoomRevenue + totalAdditionalRevenue;
      
      // Calculate ADR (if there were occupied rooms)
      const adr = totalOccupiedNights > 0 ? totalRevenue / totalOccupiedNights : 0;
      
      // Fallback to invoice data if no revenue history found
      if (totalRevenue === 0) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const invoices = await Invoice.find({
          issuedAt: { $gte: dayStart, $lte: dayEnd }
        });
        
        const invoiceRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        
        return {
          date: date.toISOString().split('T')[0],
          occupancyRate,
          adr: occupiedRoomsCount ? invoiceRevenue / occupiedRoomsCount : 0,
          revenue: invoiceRevenue,
          roomRevenue: 0,  // We don't know the breakdown from invoices
          additionalRevenue: 0,
          source: 'invoices'
        };
      }
      
      return {
        date: date.toISOString().split('T')[0],
        occupancyRate,
        adr,
        revenue: totalRevenue,
        roomRevenue: totalRoomRevenue,
        additionalRevenue: totalAdditionalRevenue,
        occupiedNights: totalOccupiedNights,
        source: 'revenueHistory'
      };
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching daily data:', error);
    return res.status(500).json({ message: 'Failed to fetch daily data' });
  }
};

// Get booking sources data
export const getBookingSources = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate dates
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    // This would require a field in the booking model to track booking source
    // For now, we'll return mock data
    
    return res.status(200).json([
      { source: 'Direct', count: 45, percentage: 45 },
      { source: 'Booking.com', count: 25, percentage: 25 },
      { source: 'Expedia', count: 15, percentage: 15 },
      { source: 'Airbnb', count: 10, percentage: 10 },
      { source: 'Other', count: 5, percentage: 5 }
    ]);
  } catch (error) {
    console.error('Error fetching booking sources:', error);
    return res.status(500).json({ message: 'Failed to fetch booking sources' });
  }
};

// Get revenue trends over time (monthly or weekly)
export const getRevenueOverTime = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    // Validate dates
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Default to last year
    const end = endDate ? new Date(endDate as string) : new Date();
    
    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ message: 'Invalid hotel ID format' });
    }

    // Get all rooms for the hotel
    const rooms = await Room.find({ hotelId });

    // Prepare result map for aggregation
    const revenueMap: {
      [key: string]: {
        period: string;
        roomRevenue: number;
        additionalRevenue: number;
        totalRevenue: number;
        occupiedNights: number;
        adr: number;
      }
    } = {};

    // Process each room's revenue history
    rooms.forEach(room => {
      // Filter revenue entries within the date range
      const relevantHistory = room.revenueHistory.filter(entry => 
        entry.date >= start && entry.date <= end
      );

      // Process each entry
      relevantHistory.forEach(entry => {
        const date = new Date(entry.date);
        let periodKey: string;
        
        if (groupBy === 'week') {
          // Get the week of year
          const weekNumber = getWeekNumber(date);
          const year = date.getFullYear();
          periodKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
        } else {
          // Default to monthly
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // Months are 0-indexed
          periodKey = `${year}-${month.toString().padStart(2, '0')}`;
        }

        // Initialize period if needed
        if (!revenueMap[periodKey]) {
          revenueMap[periodKey] = {
            period: periodKey,
            roomRevenue: 0,
            additionalRevenue: 0,
            totalRevenue: 0,
            occupiedNights: 0,
            adr: 0
          };
        }

        // Add data to the period
        revenueMap[periodKey].roomRevenue += entry.roomRevenue;
        revenueMap[periodKey].additionalRevenue += entry.additionalRevenue;
        revenueMap[periodKey].totalRevenue += (entry.roomRevenue + entry.additionalRevenue);
        revenueMap[periodKey].occupiedNights += entry.occupiedNights;
      });
    });

    // Calculate ADR for each period
    Object.values(revenueMap).forEach(period => {
      period.adr = period.occupiedNights > 0 
        ? period.totalRevenue / period.occupiedNights 
        : 0;
    });

    // Convert to array and sort by period
    const result = Object.values(revenueMap).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    // If no data from revenue history, fall back to invoice-based calculation
    if (result.length === 0) {
      const invoiceData = await Invoice.aggregate([
        {
          $match: {
            issuedAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: [groupBy, 'week'] },
                {
                  year: { $year: '$issuedAt' },
                  week: { $week: '$issuedAt' }
                },
                {
                  year: { $year: '$issuedAt' },
                  month: { $month: '$issuedAt' }
                }
              ]
            },
            totalRevenue: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            period: {
              $cond: [
                { $eq: [groupBy, 'week'] },
                {
                  $concat: [
                    { $toString: '$_id.year' },
                    '-W',
                    {
                      $cond: [
                        { $lt: ['$_id.week', 10] },
                        { $concat: ['0', { $toString: '$_id.week' }] },
                        { $toString: '$_id.week' }
                      ]
                    }
                  ]
                },
                {
                  $concat: [
                    { $toString: '$_id.year' },
                    '-',
                    {
                      $cond: [
                        { $lt: ['$_id.month', 10] },
                        { $concat: ['0', { $toString: '$_id.month' }] },
                        { $toString: '$_id.month' }
                      ]
                    }
                  ]
                }
              ]
            },
            totalRevenue: 1,
            count: 1
          }
        },
        { $sort: { period: 1 } }
      ]);

      return res.status(200).json(invoiceData.map(item => ({
        period: item.period,
        roomRevenue: item.totalRevenue * 0.75, // Estimate
        additionalRevenue: item.totalRevenue * 0.25, // Estimate
        totalRevenue: item.totalRevenue,
        occupiedNights: item.count, // Estimate based on invoice count
        adr: item.count > 0 ? (item.totalRevenue * 0.75) / item.count : 0
      })));
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching revenue over time:', error);
    return res.status(500).json({ message: 'Failed to fetch revenue trend data' });
  }
};

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
