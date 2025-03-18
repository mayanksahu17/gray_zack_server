import mongoose, { Schema, Document } from "mongoose";

interface IRoom extends Document {
  id: string;
  guestId: string;
  roomId: string;
  status: string;
  category: string;
  tags: string[];
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  images: string[];
  bookings: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema<IRoom> = new Schema<IRoom>({
  id: {
    type: String,
    required: true,
    unique: true,
    primaryKey: true
  },
  guestId: {
    type: String,
  },
  roomId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'occupied', 'in maintenance', 'reserved']
  },
  category: {
    type: String,
    required: true,
    enum: ['standard', 'deluxe', 'suite', 'presidential']
  },
  tags: [{
    type: String,
  }],
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  capacity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  amenities: [{
    type: String
  }],
  bookings: [{
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  }],
}, { timestamps: true });

RoomSchema.index({ status: 1 });
RoomSchema.index({ category: 1 });
RoomSchema.index({ price: 1 });

RoomSchema.virtual('isAvailable').get(function() {
  return this.status === 'available';
});

RoomSchema.methods.canBeBooked = function() {
  return ['available', 'reserved'].includes(this.status);
};

export const Room = mongoose.model<IRoom>("Room", RoomSchema);