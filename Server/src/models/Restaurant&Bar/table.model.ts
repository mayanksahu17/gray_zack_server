import mongoose, { Schema, Document } from "mongoose";

export interface ITable extends Document {
  tableId: string;
  status: string;
  capacity: number;
  currentOrderId?: string; // Foreign Key reference (optional)
}

const TableSchema = new Schema<ITable>({
  tableId: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentOrderId: { type: String, required: false, ref: "Order" }, // Reference to Order Model
});

export const TableModel = mongoose.model<ITable>("Table", TableSchema);
