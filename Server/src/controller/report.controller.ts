import { Request, Response } from 'express';
import Room from '../models/room.model';
import RoomService from '../models/RoomService.model';
import Booking from '../models/booking.model';
import { normalizeStartDate, normalizeEndDate } from '../utills/date';  

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { hotelId, startDate, endDate } = req.query;
    if (!hotelId) return res.status(400).json({ error: 'hotelId is required' });

    const start = normalizeStartDate(startDate as string);
    const end = normalizeEndDate(endDate as string);

    // Total revenue (Room)
    const rooms = await Room.find({ hotelId }).lean();
    let totalRevenue = 0;
    for (const room of rooms) {
      const revenue = room.revenueHistory?.filter(entry =>
        entry.date >= start && entry.date <= end
      );
      for (const r of revenue) {
        totalRevenue += (r.roomRevenue || 0) + (r.additionalRevenue || 0);
      }
    }

    // Active bookings
    const activeBookings = await Booking.countDocuments({
      hotelId,
      checkInDate: { $lte: end },
      checkOutDate: { $gte: start },
      status: 'active'
    });

    // Total guests (assuming Booking has guestCount field)
    const guestAgg = await Booking.aggregate([
      {
        $match: {
          hotelId: new Date(hotelId as string),
          checkInDate: { $lte: end },
          checkOutDate: { $gte: start }
        }
      },
      {
        $group: {
          _id: null,
          totalGuests: { $sum: '$guestCount' }
        }
      }
    ]);
    const totalGuests = guestAgg[0]?.totalGuests || 0;

    // Room service orders
    const roomServiceOrders = await RoomService.countDocuments({
      hotelId,
      createdAt: { $gte: start, $lte: end }
    });

    return res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeBookings,
      roomServiceOrders,
      totalGuests
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRevenueBreakdown = async (req: Request, res: Response) => {
  try {
    const { hotelId, startDate, endDate, groupBy = 'day' } = req.query;
    if (!hotelId) return res.status(400).json({ error: 'hotelId is required' });

    const start = normalizeStartDate(startDate as string);
    const end = normalizeEndDate(endDate as string);

    const rooms = await Room.find({ hotelId }).lean();

    const revenueMap = new Map<string, { roomRevenue: number, additionalRevenue: number }>();

    for (const room of rooms) {
      const entries = room.revenueHistory?.filter(entry =>
        entry.date >= start && entry.date <= end
      ) || [];

      for (const entry of entries) {
        const dateKey = groupBy === 'month'
          ? `${entry.date.getFullYear()}-${entry.date.getMonth() + 1}`
          : groupBy === 'week'
            ? `${entry.date.getFullYear()}-W${getWeekNumber(entry.date)}`
            : entry.date.toISOString().split('T')[0];

        const existing = revenueMap.get(dateKey) || { roomRevenue: 0, additionalRevenue: 0 };
        existing.roomRevenue += entry.roomRevenue;
        existing.additionalRevenue += entry.additionalRevenue;
        revenueMap.set(dateKey, existing);
      }
    }

    const result = Array.from(revenueMap.entries()).map(([date, rev]) => ({
      date,
      roomRevenue: parseFloat(rev.roomRevenue.toFixed(2)),
      additionalRevenue: parseFloat(rev.additionalRevenue.toFixed(2)),
      totalRevenue: parseFloat((rev.roomRevenue + rev.additionalRevenue).toFixed(2))
    }));

    return res.json(result);

  } catch (error) {
    console.error('Revenue breakdown error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

function getWeekNumber(d: Date) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
