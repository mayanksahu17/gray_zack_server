import mongoose, { Schema, Document } from "mongoose";

export interface IHousekeepingTask extends Document {
  taskId: string;
  roomId: string;
  assignedTo: string; // Employee ID
  status: "Pending" | "In Progress" | "Completed"; // Task status
  createdAt: Date;
  updatedAt: Date;
}

const HousekeepingTaskSchema = new Schema<IHousekeepingTask>(
  {
    taskId: { type: String, required: true, unique: true },
    roomId: { type: String, required: true },
    assignedTo: { type: String, required: true }, // Employee ID
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IHousekeepingTask>(
  "HousekeepingTask",
  HousekeepingTaskSchema
);
