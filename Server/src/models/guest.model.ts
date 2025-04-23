import mongoose, { Document, Schema, Types } from 'mongoose'

interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  idType: 'passport' | 'driver_license' | 'national_id'
  idNumber: string
  nationality?: string
  reservationNumber?: string
}

export interface GuestNote {
  id: string
  title: string
  content: string
  date: string
  staff: string
}

export interface BillingHistory {
  id: string
  description: string
  category: string
  date: string
  paymentMethod: string
  amount: number
}

export interface StayHistory {
  id: string
  checkIn: string
  checkOut: string
  nights: number
  room: string
  roomType: string
  totalSpent: number
  tags: string[]
}

export interface IGuestDocument extends Document {
  hotelId: Types.ObjectId
  personalInfo: PersonalInfo
  preferences: string[]
  isCorporateGuest?: boolean
  companyName?: string
  createdAt: Date
  updatedAt: Date
  stays: StayHistory[]
  billing: BillingHistory[]
  notes: GuestNote[]
}

const addressSchema = new Schema<Address>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  { _id: false }
)

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
        validator: (v: string) => /^[+]?[\d\s\-()]+$/.test(v),
        message: (props: any) => `${props.value} is not a valid phone number!`
      }
    },
    address: { type: String, required: true },
    idType: {
      type: String,
      required: true,
      enum: ['passport', 'driver_license', 'national_id']
    },
    idNumber: { type: String, required: true, trim: true },
    nationality: { type: String, trim: true },
    reservationNumber: { type: String, trim: true }
  },
  { _id: false }
)

const guestSchema = new Schema<IGuestDocument>(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Hotel'
    },
    personalInfo: {
      type: personalInfoSchema,
      required: true
    },
    preferences: [{ type: String, trim: true }],
    isCorporateGuest: { type: Boolean, default: false },
    companyName: { type: String, trim: true },

    stays: {
      type: [
        {
          id: String,
          checkIn: String,
          checkOut: String,
          nights: Number,
          room: String,
          roomType: String,
          totalSpent: Number,
          tags: [String]
        }
      ],
      default: []
    },

    billing: {
      type: [
        {
          id: String,
          description: String,
          category: String,
          date: String,
          paymentMethod: String,
          amount: Number
        }
      ],
      default: []
    },

    notes: {
      type: [
        {
          id: String,
          title: String,
          content: String,
          date: String,
          staff: String
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

guestSchema.index({ hotelId: 1, 'personalInfo.email': 1 })
guestSchema.index({ 'personalInfo.phone': 1 })
guestSchema.index({ 'personalInfo.idNumber': 1 })

guestSchema.virtual('fullName').get(function (this: IGuestDocument) {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`
})

const Guest = mongoose.model<IGuestDocument>('Guest', guestSchema)
export default Guest
