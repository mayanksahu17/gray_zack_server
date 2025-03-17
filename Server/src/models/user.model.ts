import mongoose, { Schema, Document } from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";

interface IUser extends Document {
    username: string;
    email: string;
    fullName: string;
    books : [Schema.Types.ObjectId[]];
    sellBooks : [Schema.Types.ObjectId[]];
    password: string;
    refreshToken?: string;
    role : string;
    address : string;


    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

// @ts-ignore
const userSchema: Schema<IUser> = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: [true, "password is required"]
    },
    refreshToken: {
        type: String
    },
    role : {
        type : String
    },
    books : [{
        type: Schema.Types.ObjectId,
        ref: "Book"
    } ],
    sellBooks : [
        {
            type : Schema.Types.ObjectId,
            ref : "Book"
        }
    ],
    address: {
        type: String
    },

}, { timestamps: true });

userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    const AccessToken = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN as string, // Asserting it as string
        {
            expiresIn: process.env.ACCESS_EXPIRY_TOKEN as string // Asserting it as string
        } as SignOptions // Asserting it as SignOptions
    );
    return AccessToken;
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET as string, // Asserting it as string
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY as string // Asserting it as string
        } as SignOptions // Asserting it as SignOptions
    );
};

export const User = mongoose.model<IUser>("User", userSchema);
