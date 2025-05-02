import { Request, Response } from 'express';
import Booking from '../models/booking.model';
import Room from '../models/room.model';
import { BookingStatus } from '../models/booking.model';
import { RoomStatus } from '../models/room.model';
import { format } from 'date-fns';
import { Types, Document } from 'mongoose';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

interface PopulatedGuest {
  firstName: string;
  lastName: string;
}

interface PopulatedRoom {
  roomNumber: string;
  type?: string;
}

interface PopulatedBooking extends Document {
  _id: Types.ObjectId;
  guestId: PopulatedGuest;
  roomId: PopulatedRoom;
  checkIn: Date;
  expectedCheckOut: Date;
  actualCheckOut?: Date;
  status: string;
  createdAt: Date;
}

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const startOfDay = dayjs().startOf('day').toDate();
    const endOfDay = dayjs().endOf('day').toDate();
    const tomorrow = dayjs().add(1, 'day').startOf('day').toDate();
    const day2 = dayjs().add(2, 'day').startOf('day').toDate();
    const day3 = dayjs().add(3, 'day').startOf('day').toDate();

    // Get today's check-ins and check-outs using the same approach as analytics
    const filter = {
      $or: [
        { actualCheckOut: { $gte: startOfDay, $lte: endOfDay } },
        { status: BookingStatus.CHECKED_IN, createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    };

    const todayBookings = await Booking.find(filter)
      .populate<{ guestId: PopulatedGuest, roomId: PopulatedRoom }>('guestId', 'firstName lastName')
      .populate('roomId', 'roomNumber');

    // Separate check-ins and check-outs
    const todayCheckIns = todayBookings.filter(booking => 
      booking.status === BookingStatus.CHECKED_IN && 
      dayjs(booking.createdAt).isBetween(startOfDay, endOfDay, null, '[]')
    );

    const todayCheckOuts = todayBookings.filter(booking => 
      booking.actualCheckOut && 
      dayjs(booking.actualCheckOut).isBetween(startOfDay, endOfDay, null, '[]')
    );

    // Get room status counts
    const roomStatusCounts = await Room.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get upcoming reservations (next 3 days)
    const upcomingReservations = {
      tomorrow: await Booking.find({
        checkIn: {
          $gte: tomorrow,
          $lt: day2
        },
        status: BookingStatus.BOOKED
      }).populate<{ guestId: PopulatedGuest, roomId: PopulatedRoom & { type: string } }>('guestId', 'firstName lastName')
        .populate('roomId', 'roomNumber type'),
      
      day2: await Booking.find({
        checkIn: {
          $gte: day2,
          $lt: day3
        },
        status: BookingStatus.BOOKED
      }).populate<{ guestId: PopulatedGuest, roomId: PopulatedRoom & { type: string } }>('guestId', 'firstName lastName')
        .populate('roomId', 'roomNumber type'),
      
      day3: await Booking.find({
        checkIn: {
          $gte: day3,
          $lt: dayjs(day3).add(1, 'day').toDate()
        },
        status: BookingStatus.BOOKED
      }).populate<{ guestId: PopulatedGuest, roomId: PopulatedRoom & { type: string } }>('guestId', 'firstName lastName')
        .populate('roomId', 'roomNumber type')
    };

    // Format the response
    const response = {
      todayCheckIns: todayCheckIns.map(booking => ({
        id: booking._id,
        name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
        time: format(booking.createdAt, 'h:mm a'),
        room: booking.roomId.roomNumber
      })),
      
      todayCheckOuts: todayCheckOuts.map(booking => ({
        id: booking._id,
        name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
        room: booking.roomId.roomNumber
      })),
      
      roomStatus: {
        available: roomStatusCounts.find(r => r._id === RoomStatus.AVAILABLE)?.count || 0,
        occupied: roomStatusCounts.find(r => r._id === RoomStatus.OCCUPIED)?.count || 0,
        cleaning: roomStatusCounts.find(r => r._id === RoomStatus.CLEANING)?.count || 0,
        maintenance: roomStatusCounts.find(r => r._id === RoomStatus.MAINTENANCE)?.count || 0
      },
      
      upcomingReservations: {
        tomorrow: upcomingReservations.tomorrow.map(booking => ({
          id: booking._id,
          name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
          roomType: booking.roomId.type,
          nights: Math.ceil((booking.expectedCheckOut.getTime() - booking.checkIn.getTime()) / (24 * 60 * 60 * 1000)),
          time: format(booking.checkIn, 'h:mm a'),
          status: booking.status
        })),
        
        day2: upcomingReservations.day2.map(booking => ({
          id: booking._id,
          name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
          roomType: booking.roomId.type,
          nights: Math.ceil((booking.expectedCheckOut.getTime() - booking.checkIn.getTime()) / (24 * 60 * 60 * 1000)),
          time: format(booking.checkIn, 'h:mm a'),
          status: booking.status
        })),
        
        day3: upcomingReservations.day3.map(booking => ({
          id: booking._id,
          name: `${booking.guestId.firstName} ${booking.guestId.lastName}`,
          roomType: booking.roomId.type,
          nights: Math.ceil((booking.expectedCheckOut.getTime() - booking.checkIn.getTime()) / (24 * 60 * 60 * 1000)),
          time: format(booking.checkIn, 'h:mm a'),
          status: booking.status
        }))
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
