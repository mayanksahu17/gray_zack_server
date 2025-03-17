import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  contactDetails: string;
  paymentDetails: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  bookingSource: string;
}

const GuestSchema: Schema<IUser> = new Schema<IUser>({
  id: {
    type: String,
    required: true,
    unique: true,
    primaryKey: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contactDetails: {
    type: String,
    required: true
  },
  paymentDetails: {
    type: String,
    required: true
  }
});

export const User = mongoose.model<IUser>("Guest", GuestSchema);