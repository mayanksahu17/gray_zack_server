import { Request, Response } from 'express';
import { asyncHandler } from '../utills/asyncHandler';
import { ApiError } from '../utills/ApiError';
import Hotel from '../models/hotel.model';
import Staff from '../models/staff.model';
import mongoose from 'mongoose';

/**
 * Create a new hotel
 * @route POST /api/hotels
 * @access Private/Admin
 */
export const createHotel = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    address,
    location,
    category,
    starRating,
    amenities,
    contactInfo,
    policies,
  } = req.body;

  // Get uploaded files
  const images = (req.files as Express.Multer.File[])?.map(file => file.path) || [];

  const hotel = await Hotel.create({
    name,
    description,
    address,
    location,
    category,
    starRating,
    images,
    amenities,
    contactInfo,
    policies,
    adminId: req.user._id
  });

  return res.status(201).json({
    success: true,
    data: hotel
  });
});

/**
 * Get all hotels
 * @route GET /api/hotels
 * @access Public
 */
export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ isActive: true });
    
    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotels',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get hotel by ID
 * @route GET /api/hotels/:id
 * @access Public
 */
export const getHotelById = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update Hotel Profile
export const updateHotelProfile = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const updateData = req.body;
  
  const hotel = await Hotel.findOneAndUpdate(
    { _id: hotelId, adminId: req.user._id },
    updateData,
    { new: true, runValidators: true }
  );

  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  return res.status(200).json({
    success: true,
    data: hotel
  });
});

// Create Staff Role
export const createStaffRole = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { role, permissions } = req.body;

  // Validate if hotel belongs to admin
  const hotel = await Hotel.findOne({ _id: hotelId, adminId: req.user._id });
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  // Create new role with permissions
  // This would typically involve updating a roles collection or similar
  return res.status(201).json({
    success: true,
    message: "Role created successfully"
  });
});

// Manage Staff
export const manageStaff = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const {
    name,
    email,
    phone,
    role,
    permissions,
    password
  } = req.body;

  const staff = await Staff.create({
    hotelId,
    name,
    email,
    phone,
    role,
    permissions,
    password
  });

  return res.status(201).json({
    success: true,
    data: staff
  });
});

// Get Hotel Analytics
export const getHotelAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { startDate, endDate } = req.query;

  // Implement analytics logic here
  // This would typically involve aggregating data from various collections

  return res.status(200).json({
    success: true,
    data: {
      occupancyRate: 0,
      averageRating: 0,
      totalBookings: 0,
      // ... other analytics
    }
  });
});

// Get Hotel Revenue
export const getHotelRevenue = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { period } = req.query;

  // Implement revenue calculation logic
  // This would typically involve aggregating booking and payment data

  return res.status(200).json({
    success: true,
    data: {
      totalRevenue: 0,
      revenueByCategory: {},
      // ... other revenue metrics
    }
  });
});

// Upgrade Plan
export const upgradePlan = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { planId } = req.body;

  // Implement plan upgrade logic
  // This would typically involve payment processing and updating subscription status

  return res.status(200).json({
    success: true,
    message: "Plan upgraded successfully"
  });
});

// Get All Hotel Staff
export const getAllHotelStaff = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { role, status, page = 1, limit = 10 } = req.query;

  const query: any = { hotelId };
  if (role) query.role = role;
  if (status) query.status = status;

  const staff = await Staff.find(query)
    .select('-password -refreshToken')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Staff.countDocuments(query);

  return res.status(200).json({
    success: true,
    data: staff,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// Get Hotel Details
export const getHotelDetails = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;

  const hotel = await Hotel.findOne({ 
    _id: hotelId, 
    adminId: req.user._id 
  });

  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  return res.status(200).json({
    success: true,
    data: hotel
  });
});
