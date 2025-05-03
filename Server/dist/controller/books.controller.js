"use strict";
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
exports.createBook = void 0;
const booking_model_1 = require("../models/booking.model");
const cloudinary_1 = require("../utills/cloudinary");
const ApiResponse_1 = require("../utills/ApiResponse");
const ApiError_1 = require("../utills/ApiError");
const user_model_1 = require("../models/user.model");
const createBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { bookName, author, seller, price } = req.body;
    try {
        if (!(bookName && author && seller && price)) {
            throw new ApiError_1.ApiError(400, "All parameters are required");
        }
        const imagePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        if (!imagePath) {
            throw new ApiError_1.ApiError(400, 'Image file is required');
        }
        const image = yield (0, cloudinary_1.uploadOnCloudinary)(imagePath);
        console.log('Image URL:', image === null || image === void 0 ? void 0 : image.url);
        const imageUrl = image === null || image === void 0 ? void 0 : image.url;
        const book = yield booking_model_1.Book.create({
            bookName,
            author,
            seller,
            price,
            image: imageUrl
        });
        const user = yield user_model_1.User.findById(seller);
        if (user) {
            user.sellBooks.push(book._id);
            yield user.save();
        }
        res.json(new ApiResponse_1.ApiResponse(200, book, "true"));
    }
    catch (error) {
        res.status(error.status || 500).json(new ApiResponse_1.ApiResponse(error.status || 500, null, error.message || 'Internal Server Error'));
    }
});
exports.createBook = createBook;
