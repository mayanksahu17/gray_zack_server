import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
    orderId: string;
    tableId: string;
    totalAmount: number;
    items: [Schema.Types.ObjectId[]];
    status: string;
    paymentStatus: string;
    timestamp: Date;
    guestId: string;
  }
  
  const OrderSchema = new Schema<IOrder>({
    orderId: { type: String, required: true, unique: true },
    tableId: { type: String, ref: "Table", required: true },
    totalAmount: { type: Number, required: true },
    items: [{
      type: Schema.Types.ObjectId,
      ref: "Menu"
  } ],
    status: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    guestId: { type: String, ref: "Guest" },
  });
  
  export default mongoose.model<IOrder>("Order", OrderSchema);
  


