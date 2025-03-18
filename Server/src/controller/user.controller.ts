import {User} from "../models/user.model";
import {asyncHandler} from "../utills/asyncHandler";
import {ApiError} from "../utills/ApiError";
import {ApiResponse} from "../utills/ApiResponse";
import { Request, Response } from 'express';
import {uploadOnCloudinary} from "../utills/cloudinary";
import jwt from "jsonwebtoken"

interface decodeToken {
    _id : string;
    username : string;
    email : string;
    fullName: string;

}
const generateAccessTokenandRefreshToken = async (userId: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const {  email, username, password, phoneNumber } = req.body;

    const trimmedFields: (string | undefined)[] = [email, username, password, phoneNumber].map(field => field?.trim());

    if (trimmedFields.some(field => field === "")) {
        throw new ApiError(400, "Fullname is required");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({

        email,
        password,
        username: username.toLowerCase(),
        phoneNumber
    });

    if (!user) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});


const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    console.log(username, password);

    if (!username && !password) {
        throw new ApiError(404, "User must have a username or password");
    }

    const user = await User.findOne({
        $or: [{ username }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isCorrect = await user.isPasswordCorrect(password);

    if (!isCorrect) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-refreshToken -password");

    const options = {
        httpOnly: true,
        secure: true,
    };

    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as decodeToken ;
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error : any) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});