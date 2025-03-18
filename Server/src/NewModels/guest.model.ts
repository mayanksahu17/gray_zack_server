import mongoose, { Document, Schema, Types } from 'mongoose';

// Define interfaces for nested objects
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  idType: 'passport' | 'driver_license' | 'national_id';
  idNumber: string;
}

interface CurrentStay {
  roomId: Types.ObjectId;
  roomNumber: string;
  checkIn: Date;
  expectedCheckOut: Date;
  actualCheckOut?: Date | null;
  adults: number;
  children: number;
  cardKey: string;
}

// Define enum for guest status
enum GuestStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
}

// Main Guest interface
export interface IGuestDocument extends Document {
  hotelId: Types.ObjectId;
  personalInfo: PersonalInfo;
  currentStay: CurrentStay;
  preferences: string[];
  status: GuestStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Create schema for nested objects
const addressSchema = new Schema<Address>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false } // Prevent Mongoose from creating _id for subdocuments
);

const personalInfoSchema = new Schema<PersonalInfo>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
    },
    phone: { 
      type: String, 
      required: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          // Basic phone validation - can be enhanced based on requirements
          return /^[+]?[\d\s-()]+$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    address: { 
      type: addressSchema, 
      required: true 
    },
    idType: { 
      type: String, 
      required: true,
      enum: ['passport', 'driver_license', 'national_id'] 
    },
    idNumber: { 
      type: String, 
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const currentStaySchema = new Schema<CurrentStay>(
  {
    roomId: { 
      type: Schema.Types.ObjectId, 
      required: true,
      ref: 'Room' // Assuming you have a Room model
    },
    roomNumber: { 
      type: String, 
      required: true,
      trim: true
    },
    checkIn: { 
      type: Date, 
      required: true 
    },
    expectedCheckOut: { 
      type: Date, 
      required: true 
    },
    actualCheckOut: { 
      type: Date, 
      default: null 
    },
    adults: { 
      type: Number, 
      required: true,
      min: [1, 'At least one adult is required'],
      max: [10, 'Maximum 10 adults allowed per room']
    },
    children: { 
      type: Number, 
      required: true,
      min: 0,
      max: [6, 'Maximum 6 children allowed per room']
    },
    cardKey: { 
      type: String, 
      required: true 
    }
  },
  { _id: false }
);

// Main Guest schema
const guestSchema = new Schema<IGuestDocument>(
  {
    hotelId: { 
      type: Schema.Types.ObjectId, 
      required: true,
      ref: 'Hotel' // Assuming you have a Hotel model
    },
    personalInfo: { 
      type: personalInfoSchema, 
      required: true 
    },
    currentStay: { 
      type: currentStaySchema, 
      required: true 
    },
    preferences: [{ 
      type: String,
      trim: true
    }],
    status: { 
      type: String, 
      required: true,
      enum: Object.values(GuestStatus),
      default: GuestStatus.CHECKED_IN
    }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    versionKey: false // Don't add __v field
  }
);

// Add indexes for common queries
guestSchema.index({ hotelId: 1, 'currentStay.roomNumber': 1 });
guestSchema.index({ 'personalInfo.email': 1 });
guestSchema.index({ status: 1 });
guestSchema.index({ 'currentStay.checkIn': 1, 'currentStay.expectedCheckOut': 1 });

// Add methods or virtuals if needed
guestSchema.virtual('fullName').get(function(this: IGuestDocument) {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Pre-save hook for data validation or manipulation
guestSchema.pre('save', function(next) {
  // Check if actualCheckOut exists, then update status to checked_out
  if (this.currentStay.actualCheckOut) {
    this.status = GuestStatus.CHECKED_OUT;
  }
  next();
});

// Create and export the model
const Guest = mongoose.model<IGuestDocument>('Guest', guestSchema);
export default Guest;