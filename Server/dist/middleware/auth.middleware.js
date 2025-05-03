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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const ApiError_1 = require("../utills/ApiError");
const asyncHandler_1 = require("../utills/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const administrator_model_1 = require("../models/administrator.model");
// @ts-ignore
exports.verifyJWT = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) || ((_c = (_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", "")) !== null && _c !== void 0 ? _c : "");
        if (!token) {
            throw new ApiError_1.ApiError(401, "Unauthorized request");
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken) {
            throw new ApiError_1.ApiError(401, "Invalid Access Token");
        }
        const user = yield administrator_model_1.Administrator.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError_1.ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Invalid access token");
    }
}));
