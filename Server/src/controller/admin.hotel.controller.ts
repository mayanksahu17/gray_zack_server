import { Request, Response } from 'express';
import Hotel from '../models/hotel.model';

/**
 * Create a new hotel
 * @route POST /api/hotels
 * @access Private/Admin
 */
export const createHotel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      address,
      location,
      category,
      starRating,
      images,
      amenities,
      priceRange,
      contactInfo,
      policies,
    } = req.body;

    // Validate required fields
    if (!name || !description || !address || !category || !starRating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create new hotel
    const hotel = new Hotel({
      name,
      description,
      address,
      location: location || {
        type: 'Point',
        coordinates: [0, 0], // Default coordinates if not provided
      },
      category,
      starRating,
      images: images || [],
      amenities: amenities || [],
      priceRange,
      contactInfo,
      policies,
    });

    // Save hotel to database
    const savedHotel = await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: savedHotel,
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hotel',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

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
