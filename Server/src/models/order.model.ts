import mongoose, { Document, Schema, Types } from 'mongoose';

// Define enum types for order status and types
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

enum OrderType {
  DINE_IN = 'dine-in',
  TAKEOUT = 'takeout',
  ROOM_SERVICE = 'room-service',
  MOBILE = 'mobile'
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded'
}

// Interface for order items
interface OrderItem {
  itemId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  status: OrderStatus;
}

// Interface for customer information
interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  roomNumber?: string;
}

// Main interface for the Order document
export interface IOrder extends Document {
  restaurantId: Types.ObjectId;
  orderType: OrderType;
  status: OrderStatus;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  deliveryInstructions?: string;
  pickupTime?: Date;
  tableNumber?: string;
  splitCheck?: {
    numberOfSplits: number;
    splitBy: 'equal' | 'custom';
    customSplits?: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema for order items
const OrderItemSchema = new Schema<OrderItem>({
  itemId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item ID is required'],
    ref: 'MenuItem'
  },
  name: {
    type: String,
    required: [true, 'Item name is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  }
}, { _id: true });

// Schema for customer information
const CustomerInfoSchema = new Schema<CustomerInfo>({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  roomNumber: {
    type: String,
    trim: true
  }
}, { _id: false });

// Main Order Schema
const OrderSchema = new Schema<IOrder>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Restaurant ID is required'],
    ref: 'Restaurant'
  },
  orderType: {
    type: String,
    enum: Object.values(OrderType),
    required: [true, 'Order type is required']
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  },
  customerInfo: {
    type: CustomerInfoSchema,
    required: [true, 'Customer information is required']
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'Order must contain at least one item'],
    validate: {
      validator: function(items: OrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  deliveryInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
  },
  pickupTime: {
    type: Date
  },
  tableNumber: {
    type: String,
    trim: true
  },
  splitCheck: {
    numberOfSplits: {
      type: Number,
      min: [1, 'Number of splits must be at least 1']
    },
    splitBy: {
      type: String,
      enum: ['equal', 'custom']
    },
    customSplits: [{
      type: Number,
      min: [0, 'Split amount cannot be negative']
    }]
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save middleware to calculate total amount
OrderSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

// Indexes for performance
OrderSchema.index({ restaurantId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderType: 1 });
OrderSchema.index({ 'customerInfo.roomNumber': 1 });
OrderSchema.index({ createdAt: -1 });

// Create and export the model
const Order = mongoose.model<IOrder>('Order', OrderSchema);

export { 
  Order, 
  OrderStatus, 
  OrderType,
  PaymentStatus 
};