// bookingController.js
import Booking from '../models/booking.model';
export  const  saveDraftCheckIn = async (req: any, res: any) => {
    try {
      // Save temporary check-in preferences
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export  const calculateBookingSummary = async (req: any, res: any) => {
    try {
      // Calculate nights, add-ons, taxes, subtotal, total
      // Return breakdown
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export  const finalizeCheckIn = async (req: any, res: any) => {
    try {
      // Final steps:
      // - Create Booking
      // - Mark room occupied
      // - Save payment info
      // - Generate invoice if needed
      // Return success
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const getGuestBookingHistory = async (req : any, res: any) => {
    try {
      const guestId = req.params.guestId;
      
      // Find all bookings for this guest and populate room details
      const bookings = await Booking.find({ guestId })
        .populate('roomId', 'roomNumber type') // Populate room details
        .populate('guestId', 'personalInfo') // Populate guest personal info
        .sort({ checkIn: -1 }); // Sort by check-in date, most recent first
      
      // Transform the bookings to include room details
      const bookingsWithRoomDetails = bookings.map(booking => ({
        ...booking.toObject(),
        roomDetails: booking.roomId
      }));

      res.status(200).json(bookingsWithRoomDetails);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
  