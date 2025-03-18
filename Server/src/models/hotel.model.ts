// create a schema of hotel with all the necessary fields 

import mongoose, { Schema, Document } from 'mongoose';

export interface IHotel extends Document {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  category: string;
  starRating: number;
  images: string[];
  amenities: string[];
  rooms: mongoose.Types.ObjectId[];
  priceRange: {
    min: number;
    max: number;
  };
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
  };
  reviews: {
    guestId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }[];
  averageRating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  employee: mongoose.Types.ObjectId[];
}

const HotelSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  category: { type: String, required: true, enum: ['Luxury', 'Business', 'Resort', 'Budget'] },
  starRating: { type: Number, required: true, min: 1, max: 5 },
  images: [{ type: String }],
  amenities: [{ type: String }],
  rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
  priceRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String }
  },
  policies: {
    checkInTime: { type: String, required: true },
    checkOutTime: { type: String, required: true },
    cancellationPolicy: { type: String, required: true }
  },
  reviews: [{
    guestId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Create index for location-based queries
HotelSchema.index({ location: '2dsphere' });

// Create index for searching by name
HotelSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IHotel>('Hotel', HotelSchema,"hotels"); 