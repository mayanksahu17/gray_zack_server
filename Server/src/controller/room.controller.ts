import { Room } from "../models/room.model";
import { Request, Response } from 'express'

// Example usage
export const createBulkRooms = async (req: Request, res: Response) => {
  
    const newRooms = await Room.createBulkRooms({
      hotelId: 'hotel123',
      category: 'deluxe',
      count: 10,
      pricePerNight: 150,
      capacity: 2,
      amenities: ['wifi', 'minibar', 'tv', 'air conditioning'],
      tags: ['ocean view', 'non-smoking']
    });
    console.log(`Successfully created ${newRooms.length} rooms`);
    }
    


    export const test = async (req: Request, res: Response) => {
  
       res.status(200).json({
        success : true,
        message : "api successful;"
       })
        }
        