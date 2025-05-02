import { Request, Response } from 'express'
import RoomService from '../models/RoomService.model'
import Booking from '../models/booking.model'
import { BookingStatus } from '../models/booking.model'

// Get active bookings for restaurant POS
export const getActiveBookings = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params

    const activeBookings = await Booking.find({
      hotelId,
      status: { $in: [BookingStatus.BOOKED, BookingStatus.CHECKED_IN] }
    })
    .populate('roomId', 'roomNumber floor')
    .populate('guestId', 'personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone personalInfo.address')
    .select('roomId guestId checkIn expectedCheckOut status')

    res.status(200).json({
      success: true,
      data: activeBookings
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Create room service charge
export const createRoomServiceCharge = async (req: Request, res: Response) => {
  try {
    const { bookingId, roomId, orderId, hotelId, amount } = req.body

    // Verify active booking
    const booking = await Booking.findOne({
      _id: bookingId,
      status: { $in: [BookingStatus.BOOKED, BookingStatus.CHECKED_IN] }
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No active booking found for this room'
      })
    }

    const roomService = await RoomService.create({
      bookingId,
      roomId,
      orderId,
      hotelId,
      amount,
      status: 'pending',
      chargedToRoom: true
    })

    res.status(201).json({
      success: true,
      data: roomService
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating room service charge',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Get room service charges for a booking
export const getRoomServiceCharges = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params

    const charges = await RoomService.find({ bookingId })
      .populate('orderId')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: charges
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room service charges',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Update room service charge status
export const updateRoomServiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, addedToInvoice } = req.body

    const roomService = await RoomService.findByIdAndUpdate(
      id,
      { status, addedToInvoice },
      { new: true }
    )

    if (!roomService) {
      return res.status(404).json({
        success: false,
        message: 'Room service charge not found'
      })
    }

    res.status(200).json({
      success: true,
      data: roomService
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room service status',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Get pending room service charges for checkout
export const getPendingCharges = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params

    const pendingCharges = await RoomService.find({
      bookingId,
      status: 'pending',
      addedToInvoice: false
    }).populate('orderId')

    const total = pendingCharges.reduce((sum, charge) => sum + charge.amount, 0)

    res.status(200).json({
      success: true,
      data: {
        charges: pendingCharges,
        total
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending charges',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 