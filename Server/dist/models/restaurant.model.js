"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.PaymentMethod = exports.OrderType = exports.OrderStatus = exports.PriceRange = exports.DishCategory = exports.CuisineType = exports.Order = exports.Restaurant = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define enum types for better type safety
var CuisineType;
(function (CuisineType) {
    CuisineType["ITALIAN"] = "italian";
    CuisineType["CHINESE"] = "chinese";
    CuisineType["INDIAN"] = "indian";
    CuisineType["MEXICAN"] = "mexican";
    CuisineType["JAPANESE"] = "japanese";
    CuisineType["AMERICAN"] = "american";
    CuisineType["MEDITERRANEAN"] = "mediterranean";
    CuisineType["FRENCH"] = "french";
    CuisineType["THAI"] = "thai";
    CuisineType["OTHER"] = "other";
})(CuisineType || (exports.CuisineType = CuisineType = {}));
var DishCategory;
(function (DishCategory) {
    DishCategory["APPETIZER"] = "appetizer";
    DishCategory["SOUP"] = "soup";
    DishCategory["SALAD"] = "salad";
    DishCategory["MAIN_COURSE"] = "main_course";
    DishCategory["DESSERT"] = "dessert";
    DishCategory["BEVERAGE"] = "beverage";
    DishCategory["SIDE"] = "side";
    DishCategory["SPECIAL"] = "special";
})(DishCategory || (exports.DishCategory = DishCategory = {}));
var PriceRange;
(function (PriceRange) {
    PriceRange["BUDGET"] = "$";
    PriceRange["MODERATE"] = "$$";
    PriceRange["UPSCALE"] = "$$$";
    PriceRange["FINE_DINING"] = "$$$$";
})(PriceRange || (exports.PriceRange = PriceRange = {}));
// New enum for order status
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["PREPARING"] = "preparing";
    OrderStatus["READY"] = "ready";
    OrderStatus["SERVED"] = "served";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
// New enum for order type
var OrderType;
(function (OrderType) {
    OrderType["DINE_IN"] = "dine_in";
    OrderType["TAKEOUT"] = "takeout";
    OrderType["DELIVERY"] = "delivery";
})(OrderType || (exports.OrderType = OrderType = {}));
// New enum for payment method
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["DEBIT_CARD"] = "debit_card";
    PaymentMethod["MOBILE_PAYMENT"] = "mobile_payment";
    PaymentMethod["ONLINE"] = "online";
    PaymentMethod["GIFT_CARD"] = "gift_card";
    PaymentMethod["ROOM"] = "room";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
// New enum for payment status
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["FAILED"] = "failed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// Regex for time format validation (HH:MM in 24-hour format)
const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
// Schema for day hours
const DayHoursSchema = new mongoose_1.Schema({
    open: {
        type: String,
        required: [true, 'Opening time is required'],
        validate: {
            validator: (value) => TIME_FORMAT_REGEX.test(value),
            message: 'Opening time must be in format HH:MM (24-hour)'
        }
    },
    close: {
        type: String,
        required: [true, 'Closing time is required'],
        validate: [
            {
                validator: (value) => TIME_FORMAT_REGEX.test(value),
                message: 'Closing time must be in format HH:MM (24-hour)'
            },
            {
                validator: function (close) {
                    // Skip validation if open time is not in correct format
                    if (!TIME_FORMAT_REGEX.test(this.open))
                        return true;
                    // Convert times to comparable format (minutes since midnight)
                    const openParts = this.open.split(':').map(Number);
                    const closeParts = close.split(':').map(Number);
                    const openMinutes = openParts[0] * 60 + openParts[1];
                    const closeMinutes = closeParts[0] * 60 + closeParts[1];
                    // Allow for 24-hour service (open == close)
                    return closeMinutes === openMinutes || closeMinutes > openMinutes;
                },
                message: 'Closing time must be after opening time or equal for 24-hour service'
            }
        ]
    }
}, { _id: false });
// Schema for table
const TableSchema = new mongoose_1.Schema({
    tableNumber: {
        type: String,
        required: [true, 'Table number is required'],
        trim: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: [true, 'Table capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    location: {
        type: String,
        enum: ['indoor', 'outdoor', 'bar'],
        required: [true, 'Table location is required']
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'reserved', 'maintenance'],
        default: 'available'
    },
    features: [{
            type: String,
            trim: true
        }],
    currentOrder: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Order'
    }
}, { _id: true });
// Schema for menu item
const MenuItemSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: [true, 'Menu item ID is required'],
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true,
        minlength: [2, 'Menu item name must be at least 2 characters long'],
        maxlength: [100, 'Menu item name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        validate: {
            validator: function (url) {
                // Skip validation if not provided
                if (!url)
                    return true;
                return /^(https?:\/\/|\/|\.\.\/|\.\/)[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/.test(url);
            },
            message: 'Image must have a valid URL or path'
        }
    },
    allergens: [{
            type: String,
            trim: true
        }],
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isVegan: {
        type: Boolean,
        default: false
    },
    isGlutenFree: {
        type: Boolean,
        default: false
    },
    spicyLevel: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    available: {
        type: Boolean,
        default: true
    },
    popular: {
        type: Boolean,
        default: false
    }
}, { _id: false });
// Schema for menu category
const MenuCategorySchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: [true, 'Category ID is required'],
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        minlength: [2, 'Category name must be at least 2 characters long'],
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [300, 'Description cannot exceed 300 characters']
    },
    items: {
        type: [MenuItemSchema],
        default: [],
        validate: {
            validator: function (items) {
                // Ensure unique item IDs within a category
                const itemIds = items.map(item => item.id);
                return new Set(itemIds).size === itemIds.length;
            },
            message: 'Menu item IDs must be unique within a category'
        }
    }
}, { _id: false });
// New schema for order item
const OrderItemSchema = new mongoose_1.Schema({
    itemId: {
        type: String,
        required: [true, 'Menu item ID is required'],
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Item price is required'],
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [200, 'Notes cannot exceed 200 characters']
    },
    modifiers: [{
            type: String,
            trim: true
        }],
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
    }
}, { _id: false });
// New schema for customer information
const CustomerInfoSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        minlength: [2, 'Customer name must be at least 2 characters long']
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                // Skip validation if not provided
                if (!v)
                    return true;
                // Basic phone validation
                return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                // Skip validation if not provided
                if (!v)
                    return true;
                // Basic email validation
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    address: {
        type: String,
        trim: true
    }
}, { _id: false });
// New schema for payment information
const PaymentInfoSchema = new mongoose_1.Schema({
    method: {
        type: String,
        enum: {
            values: Object.values(PaymentMethod),
            message: '{VALUE} is not a valid payment method'
        },
        required: [true, 'Payment method is required']
    },
    status: {
        type: String,
        enum: {
            values: Object.values(PaymentStatus),
            message: '{VALUE} is not a valid payment status'
        },
        default: PaymentStatus.PENDING
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    tip: {
        type: Number,
        min: [0, 'Tip cannot be negative'],
        default: 0
    },
    tax: {
        type: Number,
        required: [true, 'Tax amount is required'],
        min: [0, 'Tax cannot be negative']
    },
    transactionId: {
        type: String,
        trim: true
    },
    paymentDate: {
        type: Date
    },
    cardDetails: {
        last4: {
            type: String,
            trim: true
        },
        brand: {
            type: String,
            trim: true
        }
    }
}, { _id: false });
// New schema for Order
const OrderSchema = new mongoose_1.Schema({
    restaurantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Restaurant ID is required'],
        ref: 'Restaurant'
    },
    orderNumber: {
        type: String,
        required: [true, 'Order number is required'],
        trim: true,
        unique: true
    },
    customer: {
        type: CustomerInfoSchema,
        required: [true, 'Customer information is required']
    },
    items: {
        type: [OrderItemSchema],
        required: [true, 'Order items are required'],
        validate: {
            validator: function (items) {
                return items.length > 0;
            },
            message: 'Order must have at least one item'
        }
    },
    tableNumber: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: {
            values: Object.values(OrderStatus),
            message: '{VALUE} is not a valid order status'
        },
        default: OrderStatus.PENDING
    },
    type: {
        type: String,
        enum: {
            values: Object.values(OrderType),
            message: '{VALUE} is not a valid order type'
        },
        required: [true, 'Order type is required']
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        required: [true, 'Tax is required'],
        min: [0, 'Tax cannot be negative']
    },
    tip: {
        type: Number,
        min: [0, 'Tip cannot be negative'],
        default: 0
    },
    total: {
        type: Number,
        required: [true, 'Total is required'],
        min: [0, 'Total cannot be negative']
    },
    payment: {
        type: PaymentInfoSchema,
        required: [true, 'Payment information is required']
    },
    specialInstructions: {
        type: String,
        trim: true,
        maxlength: [500, 'Special instructions cannot exceed 500 characters']
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    estimatedReadyTime: {
        type: Date
    },
    completedTime: {
        type: Date
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
// Main Restaurant Schema
const RestaurantSchema = new mongoose_1.Schema({
    hotelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Hotel ID is required'],
        ref: 'Hotel'
    },
    name: {
        type: String,
        required: [true, 'Restaurant name is required'],
        trim: true,
        minlength: [2, 'Restaurant name must be at least 2 characters long'],
        maxlength: [100, 'Restaurant name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Restaurant description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    priceRange: {
        type: String,
        enum: {
            values: Object.values(PriceRange),
            message: '{VALUE} is not a valid price range'
        },
        required: [true, 'Price range is required']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                // Skip validation if not provided
                if (!v)
                    return true;
                // Basic email validation
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    operatingHours: {
        monday: { type: DayHoursSchema },
        tuesday: { type: DayHoursSchema },
        wednesday: { type: DayHoursSchema },
        thursday: { type: DayHoursSchema },
        friday: { type: DayHoursSchema },
        saturday: { type: DayHoursSchema },
        sunday: { type: DayHoursSchema }
    },
    reservationRequired: {
        type: Boolean,
        default: false
    },
    takeout: {
        type: Boolean,
        default: true
    },
    delivery: {
        type: Boolean,
        default: false
    },
    capacity: {
        type: Number,
        required: [true, 'Seating capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        min: 0,
        default: 0
    },
    images: {
        type: [String],
        validate: {
            validator: function (urls) {
                // Skip validation if not provided
                if (!urls || urls.length === 0)
                    return true;
                // Validate all URLs
                return urls.every(url => /^(https?:\/\/|\/|\.\.\/|\.\/)[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/.test(url));
            },
            message: 'All images must have valid URLs or paths'
        }
    },
    established: {
        type: Date
    },
    tables: {
        type: [TableSchema],
        default: [],
        validate: {
            validator: function (tables) {
                // Ensure unique table numbers
                const uniqueTableNumbers = tables.map((table) => table.tableNumber);
                return new Set(uniqueTableNumbers).size === uniqueTableNumbers.length;
            },
            message: 'Table numbers must be unique'
        }
    },
    menu: {
        type: [MenuCategorySchema],
        default: [],
        validate: {
            validator: function (categories) {
                // Ensure unique category IDs
                const categoryIds = categories.map(category => category.id);
                return new Set(categoryIds).size === categoryIds.length;
            },
            message: 'Menu category IDs must be unique'
        }
    },
    // New field to track active orders
    activeOrders: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Order',
        default: []
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
RestaurantSchema.index({ name: 1 });
RestaurantSchema.index({ 'cuisine': 1 });
RestaurantSchema.index({ 'location.city': 1, 'location.country': 1 });
RestaurantSchema.index({ priceRange: 1 });
RestaurantSchema.index({ averageRating: -1 });
RestaurantSchema.index({ 'menu.id': 1 }); // Index for menu categories
RestaurantSchema.index({ 'menu.items.id': 1 }); // Index for menu items
// Indexes for Order
OrderSchema.index({ restaurantId: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ 'customer.name': 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ type: 1 });
// Instance methods
RestaurantSchema.methods.isOpen = function (date) {
    const targetDate = date || new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const day = days[targetDate.getDay()];
    const hoursForDay = this.operatingHours[day];
    if (!hoursForDay)
        return false;
    // Extract hours and minutes from the current time
    const currentHour = targetDate.getHours();
    const currentMinute = targetDate.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    // Special case: 24-hour service
    if (hoursForDay.open === hoursForDay.close)
        return true;
    // Compare current time with operating hours
    return currentTimeStr >= hoursForDay.open && currentTimeStr < hoursForDay.close;
};
// Instance methods for table management
RestaurantSchema.methods.getAvailableTables = function () {
    return this.tables.filter((table) => table.status === 'available');
};
RestaurantSchema.methods.findTableByNumber = function (tableNumber) {
    return this.tables.find((table) => table.tableNumber === tableNumber) || null;
};
// Methods for menu management
RestaurantSchema.methods.findCategoryById = function (categoryId) {
    return this.menu.find((category) => category.id === categoryId) || null;
};
RestaurantSchema.methods.findItemById = function (itemId) {
    for (const category of this.menu) {
        const item = category.items.find((item) => item.id === itemId);
        if (item)
            return item;
    }
    return null;
};
RestaurantSchema.methods.getAvailableItems = function () {
    const availableItems = [];
    for (const category of this.menu) {
        availableItems.push(...category.items.filter((item) => item.available));
    }
    return availableItems;
};
RestaurantSchema.methods.getPopularItems = function () {
    const popularItems = [];
    for (const category of this.menu) {
        popularItems.push(...category.items.filter((item) => item.popular));
    }
    return popularItems;
};
// New restaurant methods for order management
RestaurantSchema.methods.addActiveOrder = function (orderId) {
    if (!this.activeOrders.includes(orderId)) {
        this.activeOrders.push(orderId);
    }
};
RestaurantSchema.methods.removeActiveOrder = function (orderId) {
    this.activeOrders = this.activeOrders.filter((id) => !id.equals(orderId));
};
// Pre-save hook for Order to generate orderNumber if not provided
OrderSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && !this.orderNumber) {
            // Generate order number: Date prefix + sequential number (e.g., ORD-20250404-0001)
            const today = new Date();
            const datePrefix = `ORD-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
            // Find the highest order number with today's prefix
            const Order = mongoose_1.default.model('Order');
            const lastOrder = yield Order.findOne({
                orderNumber: { $regex: `^${datePrefix}` }
            }).sort({ orderNumber: -1 });
            let sequentialNumber = 1;
            if (lastOrder && lastOrder.orderNumber) {
                const lastSequentialNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
                if (!isNaN(lastSequentialNumber)) {
                    sequentialNumber = lastSequentialNumber + 1;
                }
            }
            this.orderNumber = `${datePrefix}-${sequentialNumber.toString().padStart(4, '0')}`;
        }
        next();
    });
});
// Create and export the models
const Restaurant = mongoose_1.default.model('Restaurant', RestaurantSchema);
exports.Restaurant = Restaurant;
const Order = mongoose_1.default.model('Order', OrderSchema);
exports.Order = Order;
