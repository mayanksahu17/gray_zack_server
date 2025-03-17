import mongoose, { Schema, Document } from "mongoose";

export interface IMaintenanceTicket extends Document {
    ticketId: string;
    roomId: string;
    issue: string;
    status: "Open" | "In Progress" | "Resolved";
    assignedTo?: string; // Employee ID (optional)
    createdAt: Date;
    updatedAt: Date;
  }
  
  const MaintenanceTicketSchema = new Schema<IMaintenanceTicket>(
    {
      ticketId: { type: String, required: true, unique: true },
      roomId: { type: String, required: true },
      issue: { type: String, required: true },
      status: {
        type: String,
        enum: ["Open", "In Progress", "Resolved"],
        required: true,
      },
      assignedTo: { type: String }, // Optional Employee ID
    },
    { timestamps: true }
  );
  
  export default mongoose.model<IMaintenanceTicket>(
    "MaintenanceTicket",
    MaintenanceTicketSchema
  );
  