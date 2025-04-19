import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Guest from '../models/guest.model';
import Room from '../models/room.model';
import RoomService from '../models/RoomService.model';
import Invoice from '../models/invoice.model';
import Booking, { BookingStatus } from '../models/booking.model';

/**
 * Get checkout details for a guest by userId
 * This endpoint retrieves all required data for checkout including:
 * - Guest information
 * - Room information
 * - Room services used
 * - Payment status
 */
export const getCheckoutDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    // Find the guest
    const guest = await Guest.findById(userId);
    if (!guest) {
      res.status(404).json({ error: 'Guest not found' });
      return;
    }

    // Find active booking for this guest
    const booking = await Booking.findOne({
      guestId: userId,
      status: BookingStatus.CHECKED_IN
    }).populate('roomId');

    if (!booking) {
      res.status(404).json({ error: 'No active booking found for this guest' });
      return;
    }

    // Get room service charges
    const roomServices = await RoomService.find({
      bookingId: booking._id,
      addedToInvoice: false
    }).populate('orderId');

    // Calculate totals
    const roomServiceTotal = roomServices.reduce((sum, service) => sum + service.amount, 0);
    
    // Calculate room charges
    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    const nightsStayed = Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const roomRate = booking.roomId ? (booking.roomId as any).pricePerNight : 0;
    const roomChargeTotal = roomRate * nightsStayed;

    // Get add-on charges
    const addOnTotal = booking.addOns.reduce((sum, addon) => sum + addon.cost, 0);

    // Calculate grand total
    const subtotal = roomChargeTotal + roomServiceTotal + addOnTotal;
    const taxRate = 0.10; // 10% tax rate
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

    res.status(200).json({
      success: true,
      data: {
        guest,
        booking,
        room: booking.roomId,
        roomServices,
        summary: {
          nightsStayed,
          roomRate,
          roomChargeTotal,
          roomServiceTotal,
          addOnTotal,
          subtotal,
          taxAmount,
          grandTotal,
          alreadyPaid: booking.payment.paidAmount,
          remainingBalance: grandTotal - booking.payment.paidAmount
        }
      }
    });
  } catch (err: any) {
    console.error('Error fetching checkout details:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

/**
 * Process checkout payment and complete the checkout process
 */
export const processCheckout = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      userId, 
      bookingId, 
      paymentMethod, 
      paymentDetails,
      roomServices 
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    // Find the booking
    const booking = await Booking.findOne({ 
      _id: bookingId,
      guestId: userId,
      status: BookingStatus.CHECKED_IN
    }).populate('roomId').session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ error: 'Active booking not found' });
      return;
    }

    const room = booking.roomId as any;
    
    // Calculate checkout totals
    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    const nightsStayed = Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const roomRate = room.pricePerNight;
    const roomChargeTotal = roomRate * nightsStayed;
    
    // Get room service charges that need to be added to invoice
    const roomServiceIds = roomServices.map((id: string) => id);
    const roomServiceItems = await RoomService.find({
      _id: { $in: roomServiceIds },
      bookingId: bookingId,
      addedToInvoice: false
    }).session(session);

    const roomServiceTotal = roomServiceItems.reduce((sum, service) => sum + service.amount, 0);
    
    // Add-on charges
    const addOnTotal = booking.addOns.reduce((sum, addon) => sum + addon.cost, 0);

    // Calculate totals for invoice
    const subtotal = roomChargeTotal + roomServiceTotal + addOnTotal;
    const taxRate = 0.10; // 10% tax rate
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;
    const balanceDue = grandTotal - booking.payment.paidAmount;

    // Prepare invoice line items
    // Use specific string literals that match the enum in the model
    const lineItems = [
      {
        type: 'room_charge',
        description: `Room charges for ${nightsStayed} nights at $${roomRate}/night`,
        amount: roomChargeTotal
      },
      {
        type: 'tax',
        description: `Tax (10%)`,
        amount: taxAmount
      }
    ];

    // Add room service items
    for (const service of roomServiceItems) {
      lineItems.push({
        type: 'room_service',
        description: `Room service: ${service._id}`,
        amount: service.amount
      });
    }

    // Add add-ons if any
    if (booking.addOns.length > 0) {
      for (const addon of booking.addOns) {
        lineItems.push({
          type: 'add_on',
          description: `Add-on: ${addon.name}`,
          amount: addon.cost
        });
      }
    }

    // Process payment
    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    let paidAmount = booking.payment.paidAmount;
    let transactionId = undefined;

    // Process payment based on payment method
    if (paymentMethod === 'credit_card' || paymentMethod === 'online') {
      // For online payment, use the transaction ID from PaidYET if available
      if (paymentMethod === 'online' && paymentDetails && paymentDetails.transactionId) {
        transactionId = paymentDetails.transactionId;
      } else {
        // Simulate payment processing for credit card
        transactionId = `TXN${Date.now()}`;
      }
      paymentStatus = 'paid';
      paidAmount += balanceDue;
    } else if (paymentMethod === 'cash') {
      paymentStatus = 'paid';
      paidAmount += balanceDue;
    } else if (paymentMethod === 'corporate') {
      // Corporate account billing
      paymentStatus = 'paid';
      paidAmount += balanceDue;
      transactionId = `CORP${Date.now()}`;
    }

    // Create invoice
    const invoice = await Invoice.create([{
      bookingId: booking._id,
      guestId: userId,
      roomId: room._id,
      lineItems,
      subtotal,
      taxAmount,
      totalAmount: grandTotal,
      billing: {
        method: paymentMethod === 'credit_card' ? 'credit_card' : 
                paymentMethod === 'cash' ? 'cash' : 
                paymentMethod === 'online' ? 'online' : 'corporate',
        paidAmount,
        status: paymentStatus,
        transactionId,
        paidAt: new Date()
      }
    }], { session });

    // Update room service items to mark them as added to invoice
    await RoomService.updateMany(
      { _id: { $in: roomServiceIds } },
      { addedToInvoice: true, status: 'charged' },
      { session }
    );

    // Update booking status
    await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status: BookingStatus.CHECKED_OUT,
        actualCheckOut: new Date(),
        payment: {
          ...booking.payment,
          status: paymentStatus,
          paidAmount,
          transactionId: transactionId || booking.payment.transactionId
        }
      },
      { session }
    );

    // Update room status
    await Room.findByIdAndUpdate(
      room._id,
      { 
        status: 'cleaning',
        lastCleaned: null // Will require cleaning
      },
      { session }
    );

    // Update hotel statistics (revenue, occupancy)
    // This would typically be done through a separate hotel stats model
    // For now, we'll just include relevant data in the response

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Checkout completed successfully',
      data: {
        invoice: invoice[0],
        paymentStatus,
        checkoutDate: new Date(),
        nightsStayed,
        roomRevenue: roomChargeTotal,
        additionalRevenue: roomServiceTotal + addOnTotal,
        totalRevenue: grandTotal
      }
    });

  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error processing checkout:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

/**
 * Get checkout history for a guest
 */
export const getCheckoutHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    // Find previous bookings for this guest that have been checked out
    const bookings = await Booking.find({
      guestId: userId,
      status: BookingStatus.CHECKED_OUT
    })
    .populate('roomId')
    .sort({ actualCheckOut: -1 });

    // Get associated invoices
    const invoices = await Invoice.find({
      guestId: userId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        invoices
      }
    });
  } catch (err: any) {
    console.error('Error fetching checkout history:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}; 