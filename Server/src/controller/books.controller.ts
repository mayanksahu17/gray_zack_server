import {Book} from '../models/book.model'
import {Request , Response} from "express";
import {asyncHandler} from "../utills/asyncHandler";
import {uploadOnCloudinary} from "../utills/cloudinary";
import {ApiResponse} from "../utills/ApiResponse";
import {ApiError} from "../utills/ApiError";
import {User} from "../models/user.model";


const createBook = async (req: Request, res: Response) => {
    const { bookName, author, seller, price } = req.body;

    try {
        if (!(bookName && author && seller && price)) {
            throw new ApiError(400, "All parameters are required");
        }

        const imagePath = req.file?.path;
        if (!imagePath) {
            throw new ApiError(400, 'Image file is required');
        }

        const image = await uploadOnCloudinary(imagePath);
        console.log('Image URL:', image?.url);
        const imageUrl = image?.url;

        const book = await Book.create({
            bookName,
            author,
            seller,
            price,
            image: imageUrl
        });

        const user = await User.findById(seller);
        if (user) {
            user.sellBooks.push(book._id);
            await user.save();
        }

        res.json(new ApiResponse(200, book, "true"));
    } catch (error : any) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message || 'Internal Server Error'));
    }
};

export  {
    createBook
}