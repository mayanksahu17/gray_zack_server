import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs


interface BulkRoomCreationParams {
  hotelId: string;
  category: string;
  count: number;
  pricePerNight: number;
  capacity: number;
  amenities?: string[];
  tags?: string[];
  images?: string[];
}


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

// Add this interface for static methods
interface IRoomModel extends mongoose.Model<IRoom> {
  createBulkRooms(params: BulkRoomCreationParams): Promise<IRoom[]>;
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

// Add this static method to your RoomSchema
RoomSchema.statics.createBulkRooms = async function(params: BulkRoomCreationParams) {
  const {
    hotelId,
    category,
    count,
    pricePerNight,
    capacity,
    amenities = [],
    tags = [],
    images = []
  } = params;
  
  // Validate category is valid
  if (!['standard', 'deluxe', 'suite', 'presidential'].includes(category)) {
    throw new Error(`Invalid room category: ${category}`);
  }
  
  // Create room documents
  const roomsToCreate = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a sequential room number based on category and index
    const roomNumber = `${category.charAt(0).toUpperCase()}${String(i + 1).padStart(3, '0')}`;
    
    roomsToCreate.push({
      id: uuidv4(), // Generate unique ID for each room
      roomId: `${hotelId}-${roomNumber}`,
      status: 'available',
      category,
      tags,
      pricePerNight,
      capacity,
      amenities,
      images,
      bookings: []
    });
  }
  
  // Use insertMany for efficient bulk creation
  const createdRooms = await this.insertMany(roomsToCreate);
  return createdRooms;
};

// Don't forget to update your model definition to include the static methods


export const Room = mongoose.model<IRoom, IRoomModel>("Room", RoomSchema,"rooms");

