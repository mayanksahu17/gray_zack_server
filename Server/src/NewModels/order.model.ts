import mongoose, { Document, Schema, Types } from 'mongoose';

// Define enum types for better type safety
enum ServiceType {
  RESTAURANT = 'restaurant',
  BAR = 'bar',
  SPA = 'spa',
  ROOM_SERVICE = 'room_service'
}

enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

enum PaymentStatus {
  PAID = 'paid',
  CHARGED_TO_ROOM = 'charged_to_room',
  PENDING = 'pending'
}

// Interface for order items
interface OrderItem {
  itemId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Main interface for the ServiceOrder document
export interface IServiceOrder extends Document {
  hotelId: Types.ObjectId;
  guestId: Types.ObjectId;
  roomId: Types.ObjectId;
  roomNumber: string;
  serviceId: Types.ObjectId;
  serviceType: ServiceType;
  serviceName: string;
  items: OrderItem[];
  employeeId: Types.ObjectId;
  status: OrderStatus;
  totalAmount: number;
  tax: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  calculateTotals(): void;
  isCompleted(): boolean;
  chargeToRoom(): void;
  markAsPaid(): void;
  cancel(reason?: string): void;
}

// Schema for order items
const OrderItemSchema = new Schema<OrderItem>({
  itemId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item ID is required'],
    ref: 'MenuItem' // Reference to menu items collection
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [2, 'Item name must be at least 2 characters long'],
    maxlength: [100, 'Item name cannot exceed 100 characters']
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
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative'],
    validate: {
      validator: function(this: any) {
        const calculatedSubtotal = this.quantity * this.price;
        // Allow for minor floating point differences
        return Math.abs(calculatedSubtotal - this.subtotal) < 0.01;
      },
      message: 'Subtotal must equal quantity multiplied by price'
    }
  }
}, { _id: true });

// Main ServiceOrder Schema
const ServiceOrderSchema = new Schema<IServiceOrder>({
  hotelId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Hotel ID is required'],
    ref: 'Hotel'
  },
  guestId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Guest ID is required'],
    ref: 'Guest'
  },
  roomId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Room ID is required'],
    ref: 'Room'
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Service ID is required'],
    ref: 'Service'
  },
  serviceType: {
    type: String,
    enum: {
      values: Object.values(ServiceType),
      message: '{VALUE} is not a valid service type'
    },
    required: [true, 'Service type is required']
  },
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    minlength: [2, 'Service name must be at least 2 characters long'],
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items: OrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Employee ID is required'],
    ref: 'Employee'
  },
  status: {
    type: String,
    enum: {
      values: Object.values(OrderStatus),
      message: '{VALUE} is not a valid order status'
    },
    default: OrderStatus.PENDING
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
    validate: {
      validator: function(this: any, total: number) {
        if (!this.items || this.items.length === 0) return true;
        
        const calculatedTotal = this.items.reduce(
          (sum: number, item: OrderItem) => sum + item.subtotal, 0
        );
        
        // Allow for minor floating point differences
        return Math.abs(calculatedTotal - total) < 0.01;
      },
      message: 'Total amount does not match the sum of item subtotals'
    }
  },
  tax: {
    type: Number,
    required: [true, 'Tax is required'],
    min: [0, 'Tax cannot be negative']
  },
  grandTotal: {
    type: Number,
    required: [true, 'Grand total is required'],
    min: [0, 'Grand total cannot be negative'],
    validate: {
      validator: function(this: any, grandTotal: number) {
        const calculatedGrandTotal = this.totalAmount + this.tax;
        
        // Allow for minor floating point differences
        return Math.abs(calculatedGrandTotal - grandTotal) < 0.01;
      },
      message: 'Grand total does not match the sum of total amount and tax'
    }
  },
  paymentStatus: {
    type: String,
    enum: {
      values: Object.values(PaymentStatus),
      message: '{VALUE} is not a valid payment status'
    },
    default: PaymentStatus.PENDING,
    validate: {
      validator: function(this: any, paymentStatus: string) {
        // If order is cancelled, payment status should not be PAID
        if (this.status === OrderStatus.CANCELLED && paymentStatus === PaymentStatus.PAID) {
          return false;
        }
        return true;
      },
      message: 'Payment status is inconsistent with order status'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  orderDate: {
    type: Date,
    required: [true, 'Order date is required'],
    default: Date.now
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

// Indexes for performance
ServiceOrderSchema.index({ hotelId: 1, createdAt: -1 });
ServiceOrderSchema.index({ guestId: 1, createdAt: -1 });
ServiceOrderSchema.index({ roomId: 1 });
ServiceOrderSchema.index({ status: 1 });
ServiceOrderSchema.index({ paymentStatus: 1 });
ServiceOrderSchema.index({ serviceType: 1 });
ServiceOrderSchema.index({ orderDate: 1 });

// Instance methods
ServiceOrderSchema.methods.calculateTotals = function(): void {
  // Calculate total from items
  this.totalAmount = Number(
    this.items.reduce((sum: number, item: OrderItem) => sum + item.subtotal, 0).toFixed(2)
  );
  
  // Calculate tax (assuming tax is 10% of totalAmount for this example)
  this.tax = Number((this.totalAmount * 0.1).toFixed(2));
  
  // Calculate grand total
  this.grandTotal = Number((this.totalAmount + this.tax).toFixed(2));
};

ServiceOrderSchema.methods.isCompleted = function(): boolean {
  return this.status === OrderStatus.COMPLETED;
};

ServiceOrderSchema.methods.chargeToRoom = function(): void {
  this.paymentStatus = PaymentStatus.CHARGED_TO_ROOM;
  this.markModified('paymentStatus');
};

ServiceOrderSchema.methods.markAsPaid = function(): void {
  this.paymentStatus = PaymentStatus.PAID;
  this.markModified('paymentStatus');
};

ServiceOrderSchema.methods.cancel = function(reason?: string): void {
  if (this.status === OrderStatus.COMPLETED) {
    throw new Error('Cannot cancel a completed order');
  }
  
  this.status = OrderStatus.CANCELLED;
  if (reason) {
    this.notes = this.notes ? `${this.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
  }
  
  // Reset payment status if it was pending
  if (this.paymentStatus === PaymentStatus.PENDING) {
    this.paymentStatus = PaymentStatus.PENDING;
  }
  
  this.markModified('status');
  this.markModified('notes');
  this.markModified('paymentStatus');
};

// Pre-save middleware
ServiceOrderSchema.pre('save', function(next) {
  // Ensure item subtotals are calculated correctly
  for (const item of this.items) {
    item.subtotal = Number((item.quantity * item.price).toFixed(2));
  }
  
  // Recalculate totals before saving
  this.calculateTotals();
  
  next();
});

// Virtual properties
ServiceOrderSchema.virtual('itemCount').get(function(this: IServiceOrder) {
  return this.items.reduce((total: number, item: OrderItem) => total + item.quantity, 0);
});

ServiceOrderSchema.virtual('averageItemPrice').get(function(this: IServiceOrder) {
  if (this.items.length === 0) return 0;
  
  const totalQuantity = this.items.reduce((total: number, item: OrderItem) => total + item.quantity, 0);
  return Number((this.totalAmount / totalQuantity).toFixed(2));
});

// Create and export the model
const ServiceOrder = mongoose.model<IServiceOrder>('ServiceOrder', ServiceOrderSchema);

export { 
  ServiceOrder, 
  ServiceType, 
  OrderStatus, 
  PaymentStatus 
};