import { Request, Response } from 'express';
import Guest from '../models/guest.model';
import Room from '../models/room.model';
import Booking from '../models/booking.model';
import mongoose from 'mongoose';

export const unifiedSearch = async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing search query' });
  }

  const searchRegex = new RegExp(q, 'i');
  const isObjectId = mongoose.Types.ObjectId.isValid(q);

  try {
    // Search Guests (by name, email, phone, idNumber)
    const guestOr: any[] = [
      { 'personalInfo.firstName': searchRegex },
      { 'personalInfo.lastName': searchRegex },
      { 'personalInfo.email': searchRegex },
      { 'personalInfo.phone': searchRegex },
      { 'personalInfo.idNumber': searchRegex },
    ];
    if (isObjectId) guestOr.push({ _id: q });
    const guestQuery = { $or: guestOr };
    const guests = await Guest.find(guestQuery).limit(10);

    // Search Rooms (by roomNumber or type)
    const roomOr: any[] = [
      { roomNumber: searchRegex },
      { type: searchRegex }
    ];
    if (isObjectId) roomOr.push({ _id: q });
    const roomQuery = { $or: roomOr };
    const rooms = await Room.find(roomQuery).limit(10);

    // Search Reservations (by reservation number or guest name)
    let reservationQuery: any = [
      { _id: isObjectId ? q : undefined },
    ];
    // Find guest IDs matching the name
    const guestIds = guests.map(g => g._id);
    if (guestIds.length > 0) {
      reservationQuery.push({ guestId: { $in: guestIds } });
    }
    // Also allow searching by room number
    const roomIds = rooms.map(r => r._id);
    if (roomIds.length > 0) {
      reservationQuery.push({ roomId: { $in: roomIds } });
    }
    // Remove undefined
    reservationQuery = reservationQuery.filter(Boolean);
    const bookings = await Booking.find(reservationQuery.length ? { $or: reservationQuery } : {}).limit(10)
      .populate('guestId', 'personalInfo.firstName personalInfo.lastName personalInfo.email')
      .populate('roomId', 'roomNumber type');

    res.json({
      guests,
      rooms,
      reservations: bookings
    });
  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
}; 