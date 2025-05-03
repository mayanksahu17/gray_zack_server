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
exports.searchGuests = exports.deleteGuest = exports.updateGuest = exports.getGuestsByHotel = exports.getGuestById = exports.createGuest = void 0;
const guest_model_1 = __importDefault(require("../models/guest.model")); // adjust path if needed
const mongoose_1 = __importDefault(require("mongoose"));
// Create a guest if not exists
const createGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId, personalInfo } = req.body;
        console.log(hotelId, personalInfo);
        const existingGuest = yield guest_model_1.default.findOne({
            hotelId: new mongoose_1.default.Types.ObjectId(hotelId),
            $or: [
                { 'personalInfo.email': personalInfo.email },
                { 'personalInfo.phone': personalInfo.phone },
                { 'personalInfo.idNumber': personalInfo.idNumber }
            ]
        });
        if (existingGuest) {
            res.status(200).json({ message: 'Guest already exists', guestId: existingGuest._id });
            return;
        }
        const newGuest = new guest_model_1.default(req.body);
        const savedGuest = yield newGuest.save();
        res.status(201).json({ message: 'Guest created successfully', guestId: savedGuest._id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.createGuest = createGuest;
// Get guest by ID
const getGuestById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guest = yield guest_model_1.default.findById(req.params.id);
        if (!guest) {
            res.status(404).json({ message: 'Guest not found' });
            return;
        }
        res.status(200).json(guest);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getGuestById = getGuestById;
// Get all guests for a hotel
const getGuestsByHotel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const guests = yield guest_model_1.default.find({ hotelId: req.params.hotelId });
        res.status(200).json(guests);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getGuestsByHotel = getGuestsByHotel;
// Update guest
const updateGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedGuest = yield guest_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedGuest) {
            res.status(404).json({ message: 'Guest not found' });
            return;
        }
        res.status(200).json({ message: 'Guest updated successfully', guest: updatedGuest });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.updateGuest = updateGuest;
// Delete guest
const deleteGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedGuest = yield guest_model_1.default.findByIdAndDelete(req.params.id);
        if (!deletedGuest) {
            res.status(404).json({ message: 'Guest not found' });
            return;
        }
        res.status(200).json({ message: 'Guest deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.deleteGuest = deleteGuest;
// Search guest by email, phone, or ID number
const searchGuests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone, idNumber } = req.query;
        const searchConditions = [];
        if (email)
            searchConditions.push({ 'personalInfo.email': email });
        if (phone)
            searchConditions.push({ 'personalInfo.phone': phone });
        if (idNumber)
            searchConditions.push({ 'personalInfo.idNumber': idNumber });
        if (searchConditions.length === 0) {
            res.status(400).json({
                message: 'Please provide at least one query parameter: email, phone, or idNumber.'
            });
            return;
        }
        const guests = yield guest_model_1.default.find({ $or: searchConditions });
        res.status(200).json(guests);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.searchGuests = searchGuests;
