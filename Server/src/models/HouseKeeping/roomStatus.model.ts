import mongoose, { Schema, Document } from "mongoose";

export interface IRoomStatus extends Document {
    roomId: string;
    status: "Vacant" | "Occupied" | "Cleaning in Progress" | "Maintenance";
    lastUpdated: Date;
  }
  
  const RoomStatusSchema = new Schema<IRoomStatus>(
    {
      roomId: { type: String, required: true, unique: true },
      status: {
        type: String,
        enum: ["Vacant", "Occupied", "Cleaning in Progress", "Maintenance"],
        required: true,
      },
      lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
  );
  
  export default mongoose.model<IRoomStatus>("RoomStatus", RoomStatusSchema);
  