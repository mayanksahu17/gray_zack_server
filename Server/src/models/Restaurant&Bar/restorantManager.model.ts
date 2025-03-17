import mongoose, { Schema, Document, Types } from "mongoose";

// Menu Item Schema (based on your existing model with minor enhancements)
export interface IMenu extends Document {
  itemId: string;
  name: string;
  section: "Starters" | "Mains" | "Desserts" | "Drinks" | "Sides";
  category: string;
  price: number;
  availability: boolean;
  dynamicPricing: boolean;
  description: string;
  imageUrl?: string;
  ingredients?: string[];
  allergens?: string[];
  createdBy: Types.ObjectId;
  updatedAt: Date;
}

const MenuSchema = new Schema<IMenu>({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  section: {
    type: String,
    enum: ["Starters", "Mains", "Desserts", "Drinks", "Sides"],
    required: true,
  },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, required: true, default: true },
  dynamicPricing: { type: Boolean, required: true, default: false },
  description: { type: String },
  imageUrl: { type: String },
  ingredients: [{ type: String }],
  allergens: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Employee Schema
export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "chef" | "server" | "manager" | "admin";
  isActive: boolean;
  permissionLevel: number; // Higher number means more permissions
  lastLogin?: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["chef", "server", "manager", "admin"],
    required: true
  },
  isActive: { type: Boolean, default: true },
  permissionLevel: { type: Number, default: 1 },
  lastLogin: { type: Date }
}, { timestamps: true });

// Room Schema
export interface IRoom extends Document {
  roomNumber: string;
  floor: number;
  type: "standard" | "deluxe" | "suite" | "presidential";
  isOccupied: boolean;
  currentGuest?: Types.ObjectId;
}

const RoomSchema = new Schema<IRoom>({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ["standard", "deluxe", "suite", "presidential"],
    required: true 
  },
  isOccupied: { type: Boolean, default: false },
  currentGuest: { type: Schema.Types.ObjectId, ref: 'Guest' }
}, { timestamps: true });

// Guest Schema
export interface IGuest extends Document {
  guestId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  checkInDate: Date;
  checkOutDate: Date;
  specialRequests?: string;
}

const GuestSchema = new Schema<IGuest>({
  guestId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  specialRequests: { type: String }
}, { timestamps: true });

// Order Schema
export interface IOrder extends Document {
  orderId: string;
  room: Types.ObjectId;
  guest: Types.ObjectId;
  items: {
    menuItem: Types.ObjectId;
    quantity: number;
    specialInstructions?: string;
    price: number; // Capture price at time of order
  }[];
  status: "pending" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled";
  totalAmount: number;
  placedAt: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  handledBy?: Types.ObjectId;
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: "room_charge" | "cash" | "card";
  notes?: string;
  statusHistory: {
    status: string;
    timestamp: Date;
    updatedBy: Types.ObjectId;
    note?: string;
  }[];
}

const OrderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  guest: { type: Schema.Types.ObjectId, ref: 'Guest', required: true },
  items: [{
    menuItem: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    quantity: { type: Number, required: true, min: 1 },
    specialInstructions: { type: String },
    price: { type: Number, required: true }
  }],
  status: { 
    type: String, 
    enum: ["pending", "accepted", "preparing", "ready", "delivered", "cancelled"],
    default: "pending",
    required: true 
  },
  totalAmount: { type: Number, required: true },
  placedAt: { type: Date, default: Date.now, required: true },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  handledBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid", "refunded"],
    default: "pending",
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ["room_charge", "cash", "card"]
  },
  notes: { type: String },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    note: { type: String }
  }]
}, { timestamps: true });

// Activity Log Schema (for auditing)
export interface IActivityLog extends Document {
  action: "create" | "update" | "delete";
  model: "menu" | "order" | "employee" | "room" | "guest";
  documentId: Types.ObjectId;
  performedBy: Types.ObjectId;
  timestamp: Date;
  details: Record<string, any>;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  action: { 
    type: String, 
    enum: ["create", "update", "delete"],
    required: true 
  },
  model: { 
    type: String, 
    enum: ["menu", "order", "employee", "room", "guest"],
    required: true 
  },
  documentId: { type: Schema.Types.ObjectId, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  details: { type: Schema.Types.Mixed }
});

// Export models
export const Menu = mongoose.model<IMenu>("Menu", MenuSchema);
export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);
export const Room = mongoose.model<IRoom>("Room", RoomSchema);
export const Guest = mongoose.model<IGuest>("Guest", GuestSchema);
export const Order = mongoose.model<IOrder>("Order", OrderSchema);
export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);