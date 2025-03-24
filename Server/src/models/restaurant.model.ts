import mongoose, { Document, Schema, Types } from 'mongoose';

// Define enum types for better type safety
enum CuisineType {
  ITALIAN = 'italian',
  CHINESE = 'chinese',
  INDIAN = 'indian',
  MEXICAN = 'mexican',
  JAPANESE = 'japanese',
  AMERICAN = 'american',
  MEDITERRANEAN = 'mediterranean',
  FRENCH = 'french',
  THAI = 'thai',
  OTHER = 'other'
}

enum DishCategory {
  APPETIZER = 'appetizer',
  SOUP = 'soup',
  SALAD = 'salad',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SIDE = 'side',
  SPECIAL = 'special'
}

enum PriceRange {
  BUDGET = '$',
  MODERATE = '$$',
  UPSCALE = '$$$',
  FINE_DINING = '$$$$'
}

// Interface for day hours
interface DayHours {
  open: string;
  close: string;
}

// Interface for operating hours
interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

// Interface for menu items
interface MenuItem {
  itemId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: DishCategory;
  available: boolean;
  image?: string;
  ingredients?: string[];
  allergens?: string[];
  spicyLevel?: number; // 0-5 scale
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  preparationTime?: number; // in minutes
  popular?: boolean;
}

// Interface for restaurant location
interface Location {
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Main interface for the Restaurant document
export interface IRestaurant extends Document {
  name: string;
  description: string;
  cuisine: CuisineType[];
  priceRange: PriceRange;
  website?: string;
  menuItems: MenuItem[];
  operatingHours: OperatingHours;
  reservationRequired: boolean;
  takeout: boolean;
  delivery: boolean;
  capacity: number;
  averageRating?: number;
  reviewCount?: number;
  images?: string[];
  established?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  isOpen(date?: Date): boolean;
  findItemById(itemId: Types.ObjectId | string): MenuItem | null;
  getAvailableItems(): MenuItem[];
  getItemsByCategory(category: DishCategory): MenuItem[];
  getPopularItems(): MenuItem[];
}

// Regex for time format validation (HH:MM in 24-hour format)
const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Schema for day hours
const DayHoursSchema = new Schema<DayHours>({
  open: {
    type: String,
    required: [true, 'Opening time is required'],
    validate: {
      validator: (value: string) => TIME_FORMAT_REGEX.test(value),
      message: 'Opening time must be in format HH:MM (24-hour)'
    }
  },
  close: {
    type: String,
    required: [true, 'Closing time is required'],
    validate: [
      {
        validator: (value: string) => TIME_FORMAT_REGEX.test(value),
        message: 'Closing time must be in format HH:MM (24-hour)'
      },
      {
        validator: function(this: any, close: string) {
          // Skip validation if open time is not in correct format
          if (!TIME_FORMAT_REGEX.test(this.open)) return true;
          
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

// Schema for location
const LocationSchema = new Schema<Location>({
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  }
}, { _id: false });

// Schema for menu items
const MenuItemSchema = new Schema<MenuItem>({
  itemId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item ID is required'],
    // Custom itemId to allow the same dishes across different restaurants
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [2, 'Item name must be at least 2 characters long'],
    maxlength: [100, 'Item name cannot exceed 100 characters']
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
  category: {
    type: String,
    enum: {
      values: Object.values(DishCategory),
      message: '{VALUE} is not a valid dish category'
    },
    required: [true, 'Dish category is required']
  },
  available: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    trim: true,
    validate: {
      validator: function(value: string) {
        // Skip validation if not provided
        if (!value) return true;
        
        // Basic URL validation for image
        return /^(https?:\/\/|\/|\.\.\/|\.\/)[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/.test(value);
      },
      message: 'Image must be a valid URL or path'
    }
  },
  ingredients: {
    type: [String],
    validate: {
      validator: function(ingredients: string[]) {
        // Ensure no duplicate ingredients
        return new Set(ingredients).size === ingredients.length;
      },
      message: 'Duplicate ingredients are not allowed'
    }
  },
  allergens: {
    type: [String]
  },
  spicyLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  vegetarian: {
    type: Boolean,
    default: false
  },
  vegan: {
    type: Boolean,
    default: false
  },
  glutenFree: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    min: 0
  },
  popular: {
    type: Boolean,
    default: false
  }
}, { _id: true });

// Main Restaurant Schema
const RestaurantSchema = new Schema<IRestaurant>({
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
  cuisine: {
    type: [{
      type: String,
      enum: {
        values: Object.values(CuisineType),
        message: '{VALUE} is not a valid cuisine type'
      }
    }],
    required: [true, 'At least one cuisine type is required'],
    validate: {
      validator: function(cuisines: string[]) {
        return cuisines.length > 0 && new Set(cuisines).size === cuisines.length;
      },
      message: 'At least one unique cuisine type is required'
    }
  },
  priceRange: {
    type: String,
    enum: {
      values: Object.values(PriceRange),
      message: '{VALUE} is not a valid price range'
    },
    required: [true, 'Price range is required']
  },
  location: {
    type: LocationSchema,
    required: [true, 'Location information is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v: string) {
        // Basic phone validation - can be enhanced based on requirements
        return /^[+]?[0-9\s\-()]{8,20}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        // Skip validation if not provided
        if (!v) return true;
        
        // Basic email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Skip validation if not provided
        if (!v) return true;
        
        // Basic URL validation
        return /^(https?:\/\/)[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/.test(v);
      },
      message: props => `${props.value} is not a valid website URL!`
    }
  },
  menuItems: {
    type: [MenuItemSchema],
    default: [],
    validate: {
      validator: function(items: MenuItem[]) {
        return items.length > 0;
      },
      message: 'Restaurant must have at least one menu item'
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
      validator: function(urls: string[]) {
        // Skip validation if not provided
        if (!urls || urls.length === 0) return true;
        
        // Validate all URLs
        return urls.every(url => 
          /^(https?:\/\/|\/|\.\.\/|\.\/)[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/.test(url)
        );
      },
      message: 'All images must have valid URLs or paths'
    }
  },
  established: {
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

// Pre-save middleware to check for duplicate item IDs
RestaurantSchema.pre('save', function(next) {
  if (!this.menuItems || this.menuItems.length === 0) {
    return next();
  }
  
  // Check for duplicate item IDs
  const itemIds = this.menuItems.map(item => item.itemId.toString());
  const uniqueItemIds = new Set(itemIds);
  
  if (itemIds.length !== uniqueItemIds.size) {
    return next(new Error('Duplicate item IDs are not allowed in menu items'));
  }
  
  next();
});

// Indexes for performance
RestaurantSchema.index({ name: 1 });
RestaurantSchema.index({ 'cuisine': 1 });
RestaurantSchema.index({ 'location.city': 1, 'location.country': 1 });
RestaurantSchema.index({ priceRange: 1 });
RestaurantSchema.index({ averageRating: -1 });
RestaurantSchema.index({ 'menuItems.itemId': 1 });
RestaurantSchema.index({ 'menuItems.category': 1 });
RestaurantSchema.index({ 'menuItems.vegetarian': 1 });
RestaurantSchema.index({ 'menuItems.vegan': 1 });
RestaurantSchema.index({ 'menuItems.glutenFree': 1 });

// Instance methods
RestaurantSchema.methods.isOpen = function(date?: Date): boolean {
  const targetDate = date || new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[targetDate.getDay()];
  
  const hoursForDay = this.operatingHours[day];
  if (!hoursForDay) return false;
  
  // Extract hours and minutes from the current time
  const currentHour = targetDate.getHours();
  const currentMinute = targetDate.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  // Special case: 24-hour service
  if (hoursForDay.open === hoursForDay.close) return true;
  
  // Compare current time with operating hours
  return currentTimeStr >= hoursForDay.open && currentTimeStr < hoursForDay.close;
};

RestaurantSchema.methods.findItemById = function(itemId: Types.ObjectId | string): MenuItem | null {
  const itemIdStr = itemId.toString();
  return this.menuItems.find((item: any) => item.itemId.toString() === itemIdStr) || null;
};

RestaurantSchema.methods.getAvailableItems = function(): MenuItem[] {
  return this.menuItems.filter((item: any) => item.available);
};

RestaurantSchema.methods.getItemsByCategory = function(category: DishCategory): MenuItem[] {
  return this.menuItems.filter((item: any) => item.category === category);
};

RestaurantSchema.methods.getPopularItems = function(): MenuItem[] {
  return this.menuItems.filter((item: any) => item.available && item.popular);
};

// Virtual properties
RestaurantSchema.virtual('itemCount').get(function(this: IRestaurant) {
  return this.menuItems.length;
});

RestaurantSchema.virtual('availableItemCount').get(function(this: IRestaurant) {
  return this.menuItems.filter(item => item.available).length;
});

RestaurantSchema.virtual('categories').get(function(this: IRestaurant) {
  return [...new Set(this.menuItems.map(item => item.category))];
});

RestaurantSchema.virtual('dietaryOptions').get(function(this: IRestaurant) {
  const hasVegetarian = this.menuItems.some(item => item.vegetarian);
  const hasVegan = this.menuItems.some(item => item.vegan);
  const hasGlutenFree = this.menuItems.some(item => item.glutenFree);
  
  return {
    vegetarian: hasVegetarian,
    vegan: hasVegan,
    glutenFree: hasGlutenFree
  };
});

// Create and export the model
const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

export { 
  Restaurant, 
  CuisineType, 
  DishCategory,
  PriceRange 
};