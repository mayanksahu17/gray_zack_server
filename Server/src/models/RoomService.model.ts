import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IRoomServiceDocument extends Document {
  bookingId: Types.ObjectId
  roomId: Types.ObjectId
  orderId: Types.ObjectId
  hotelId: Types.ObjectId
  amount: number
  status: 'pending' | 'charged' | 'cancelled'
  chargedToRoom: boolean
  addedToInvoice: boolean
  createdAt: Date
  updatedAt: Date
}

const roomServiceSchema = new Schema<IRoomServiceDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Booking'
    },
    roomId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Room'
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Order'
    },
    hotelId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Hotel'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'charged', 'cancelled'],
      default: 'pending'
    },
    chargedToRoom: {
      type: Boolean,
      default: false
    },
    addedToInvoice: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

roomServiceSchema.index({ bookingId: 1, status: 1 })
roomServiceSchema.index({ roomId: 1, createdAt: 1 })

const RoomService = mongoose.model<IRoomServiceDocument>('RoomService', roomServiceSchema)
export default RoomService
