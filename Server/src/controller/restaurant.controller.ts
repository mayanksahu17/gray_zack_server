import { Request, Response } from 'express';
import { Restaurant, IRestaurant , CuisineType, PriceRange } from '../models/restaurant.model'; // Adjust import path as needed
import mongoose from 'mongoose';
import { ApiError } from '../utills/ApiError';
import { asyncHandler } from '../utills/asyncHandler';
import Hotel from '../models/hotel.model';
import {Order} from '../models/order.model';
import { generateQRCodeImage } from '../utills/qrCodeGenerator';



// Validation helper function
const validateRestaurantData = (restaurantData: any) => {
  const errors: string[] = [];

  // Name validation
  if (!restaurantData.name) {
    errors.push('Restaurant name is required');
  } else {
    if (restaurantData.name.length < 2) {
      errors.push('Restaurant name must be at least 2 characters long');
    }
    if (restaurantData.name.length > 100) {
      errors.push('Restaurant name cannot exceed 100 characters');
    }
  }

  // Description validation
  if (!restaurantData.description) {
    errors.push('Restaurant description is required');
  } else {
    if (restaurantData.description.length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }
  }

  // Cuisine validation
  if (!restaurantData.cuisine || !Array.isArray(restaurantData.cuisine) || restaurantData.cuisine.length === 0) {
    errors.push('At least one cuisine type is required');
  } else {
    const validCuisineTypes = Object.values(CuisineType);
    const invalidCuisines = restaurantData.cuisine.filter(
      (cuisine: string) => !validCuisineTypes.includes(cuisine as CuisineType)
    );
    if (invalidCuisines.length > 0) {
      errors.push(`Invalid cuisine types: ${invalidCuisines.join(', ')}`);
    }
    if (new Set(restaurantData.cuisine).size !== restaurantData.cuisine.length) {
      errors.push('Cuisine types must be unique');
    }
  }

  // Price range validation
  if (!restaurantData.priceRange || !Object.values(PriceRange).includes(restaurantData.priceRange as PriceRange)) {
    errors.push('Valid price range is required');
  }

  // Email validation (optional)
  if (restaurantData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(restaurantData.email)) {
      errors.push('Invalid email address');
    }
  }

  // Capacity validation
  if (!restaurantData.capacity || restaurantData.capacity < 1) {
    errors.push('Seating capacity must be at least 1');
  }

  // Menu items validation
  if (!restaurantData.menuItems || !Array.isArray(restaurantData.menuItems) || restaurantData.menuItems.length === 0) {
    errors.push('At least one menu item is required');
  }

  // Images validation (optional)
  if (restaurantData.images && Array.isArray(restaurantData.images)) {
    const invalidUrls = restaurantData.images.filter(
      (url: string) => !/^(https?:\/\/|\/|\.\.\/|\.\/)[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/.test(url)
    );
    if (invalidUrls.length > 0) {
      errors.push(`Invalid image URLs: ${invalidUrls.join(', ')}`);
    }
  }

  // Tables validation
  if (restaurantData.tables && Array.isArray(restaurantData.tables)) {
    const tableNumbers = restaurantData.tables.map((table: any) => table.tableNumber);
    if (new Set(tableNumbers).size !== tableNumbers.length) {
      errors.push('Table numbers must be unique');
    }
  }

  return errors;
};


export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, ...restaurantData } = req.body;

  // Validate hotelId
  if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
    throw new ApiError(400, "Valid hotel ID is required");
  }

  // Validate restaurant data
  const validationErrors = validateRestaurantData(restaurantData);
  if (validationErrors.length > 0) {
    console.log(validationErrors);
    
    throw new ApiError(400, "Validation failed", validationErrors);
  }

  // Verify hotel belongs to the admin
  const hotel = await Hotel.findOne({ 
    _id: hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(404, "Hotel not found or you don't have permission to add restaurants to this hotel");
  }

  // Additional business logic validations
  // Check if restaurant with same name already exists in the hotel
  const existingRestaurant = await Restaurant.findOne({ 
    hotelId, 
    name: restaurantData.name 
  });

  if (existingRestaurant) {
    throw new ApiError(409, "A restaurant with this name already exists in the hotel");
  }

  // Create new restaurant with hotel association
  const newRestaurant = new Restaurant({
    ...restaurantData,
    hotelId: new mongoose.Types.ObjectId(hotelId)
  });
  
  const savedRestaurant = await newRestaurant.save();

  return res.status(201).json({
    success: true,
    message: "Restaurant created successfully",
    data: savedRestaurant
  });
});
export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const { 
      cuisine, 
      priceRange, 
      city, 
      vegetarian, 
      vegan, 
      glutenFree, 
      page = 1, 
      limit = 10 
    } = req.query;    

    const queryConditions: any = {};

    if (cuisine) queryConditions.cuisine = { $in: (cuisine as string).split(',') };
    if (priceRange) queryConditions.priceRange = priceRange;
    if (city) queryConditions['location.city'] = city;

    // Dietary options filter
    const dietaryFilters: any[] = [];
    if (vegetarian === 'true') dietaryFilters.push({ 'menuItems.vegetarian': true });
    if (vegan === 'true') dietaryFilters.push({ 'menuItems.vegan': true });
    if (glutenFree === 'true') dietaryFilters.push({ 'menuItems.glutenFree': true });

    if (dietaryFilters?.length > 0) {
      queryConditions.$or = dietaryFilters;
    }

    const restaurants = await Restaurant.find(queryConditions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-menuItems'); // Exclude menu items to reduce payload

    const total = await Restaurant.countDocuments(queryConditions);

    res.status(200).json({
      status: 'success',
      results: restaurants?.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error fetching restaurants'
    });
  }
};

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid restaurant ID'
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error fetching restaurant'
    });
  }
};

export const updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate restaurant ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  // Find restaurant and verify hotel ownership
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Verify hotel belongs to the admin
  const hotel = await Hotel.findOne({ 
    _id: restaurant.hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(403, "You don't have permission to update this restaurant");
  }

  // Update restaurant
  const updatedRestaurant = await Restaurant.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Restaurant updated successfully",
    data: updatedRestaurant
  });
});

export const deleteRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate restaurant ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  // Find restaurant and verify hotel ownership
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Verify hotel belongs to the admin
  const hotel = await Hotel.findOne({ 
    _id: restaurant.hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(403, "You don't have permission to delete this restaurant");
  }

  // Delete restaurant
  await Restaurant.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Restaurant deleted successfully"
  });
});

// Additional specialized controllers

export const checkRestaurantAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid restaurant ID'
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    const checkDate = date ? new Date(date as string) : new Date();
    const isOpen = restaurant.isOpen(checkDate);

    res.status(200).json({
      status: 'success',
      data: {
        isOpen,
        checkDate
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error checking restaurant availability'
    });
  }
};

export const getRestaurantMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      category, 
      vegetarian, 
      vegan, 
      glutenFree, 
      availableOnly 
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid restaurant ID'
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    let menuItems = restaurant.menuItems;

    // Apply filters
    if (category) {
      menuItems = menuItems.filter(item => item.category === category);
    }
    if (vegetarian === 'true') {
      menuItems = menuItems.filter(item => item.vegetarian);
    }
    if (vegan === 'true') {
      menuItems = menuItems.filter(item => item.vegan);
    }
    if (glutenFree === 'true') {
      menuItems = menuItems.filter(item => item.glutenFree);
    }
    if (availableOnly === 'true') {
      menuItems = menuItems.filter(item => item.available);
    }

    res.status(200).json({
      status: 'success',
      results: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error fetching restaurant menu'
    });
  }
};

// Menu Customization
export const addMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const menuItemData = req.body;

  // Validate restaurant ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  // Find restaurant and verify hotel ownership
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Verify hotel belongs to the admin
  const hotel = await Hotel.findOne({ 
    _id: restaurant.hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(403, "You don't have permission to modify this restaurant");
  }

  // Add new menu item
  restaurant.menuItems.push(menuItemData);
  await restaurant.save();

  return res.status(201).json({
    success: true,
    message: "Menu item added successfully",
    data: restaurant.menuItems[restaurant.menuItems.length - 1]
  });
});

export const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id, itemId } = req.params;
  const updateData = req.body;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(400, "Invalid ID format");
  }

  // Find restaurant and verify hotel ownership
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Verify hotel belongs to the admin
  const hotel = await Hotel.findOne({ 
    _id: restaurant.hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(403, "You don't have permission to modify this restaurant");
  }

  // Find and update menu item
  const menuItem = restaurant.menuItems.find(item => item.itemId.toString() === itemId);
  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  Object.assign(menuItem, updateData);
  await restaurant.save();

  return res.status(200).json({
    success: true,
    message: "Menu item updated successfully",
    data: menuItem
  });
});

// Table Management
export const addTable = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tableData = req.body;

  // Validate restaurant ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  // Find restaurant and verify hotel ownership
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Verify hotel belongs to the admin
  const hotel = await Hotel.findOne({ 
    _id: restaurant.hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(403, "You don't have permission to modify this restaurant");
  }

  // Add table to restaurant
  if (!restaurant.tables) {
    restaurant.tables = [];
  }
  restaurant.tables.push(tableData);
  await restaurant.save();

  return res.status(201).json({
    success: true,
    message: "Table added successfully",
    data: restaurant.tables[restaurant.tables.length - 1]
  });
});

// Room Service
export const createRoomServiceOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const orderData = req.body;

  // Validate restaurant ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  // Find restaurant and verify hotel ownership
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Verify hotel belongs to the admin
  const hotel = await Hotel.findOne({ 
    _id: restaurant.hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(403, "You don't have permission to create orders for this restaurant");
  }

  // Create room service order
  const order = await Order.create({
    ...orderData,
    restaurantId: id,
    orderType: 'room-service',
    status: 'pending'
  });

  return res.status(201).json({
    success: true,
    message: "Room service order created successfully",
    data: order
  });
});

// Mobile Ordering
export const generateQRCode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate restaurant ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  // Find restaurant and verify hotel ownership
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Verify hotel belongs to the admin
  const hotel = await Hotel.findOne({ 
    _id: restaurant.hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(403, "You don't have permission to generate QR code for this restaurant");
  }

  // Generate QR code (implementation depends on QR code library)
  const menuUrl = `${process.env.FRONTEND_URL}/menu/${id}`;
  const qrCode = await generateQRCodeImage(menuUrl);

  return res.status(200).json({
    success: true,
    data: {
      qrCode,
      menuUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
  });
});

export const createMobileOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const orderData = req.body;

  // Validate restaurant ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }

  // Find restaurant and verify hotel ownership
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Verify hotel belongs to the admin
  const hotel = await Hotel.findOne({ 
    _id: restaurant.hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(403, "You don't have permission to create orders for this restaurant");
  }

  // Create mobile order
  const order = await Order.create({
    ...orderData,
    restaurantId: id,
    orderType: 'mobile',
    status: 'pending'
  });

  return res.status(201).json({
    success: true,
    message: "Mobile order created successfully",
    data: order
  });
});