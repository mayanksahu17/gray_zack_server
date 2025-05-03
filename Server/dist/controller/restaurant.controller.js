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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMenuItemImage = exports.getRestaurantOrders = exports.deleteOrder = exports.updateOrderStatus = exports.getOrderById = exports.getOrders = exports.createOrder = exports.getPaymentDetails = exports.processPayment = exports.getAvailableMenuByCategory = exports.exportMenuData = exports.searchMenuItems = exports.updateTableStatus = exports.deleteRestaurantTable = exports.updateRestaurantTable = exports.addRestaurantTable = exports.getRestaurantTables = exports.deleteMenuItem = exports.updateMenuItem = exports.addMenuItem = exports.deleteMenuCategory = exports.addMenuCategory = exports.getRestaurantMenu = exports.updateRestaurant = exports.createRestaurant = exports.getRestaurantById = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const restaurant_model_1 = require("../models/restaurant.model");
const uuid_1 = require("uuid");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
// import { Order } from '../models/order.model';
// ==========================================
// Restaurant Information Controllers
// ==========================================
/**
 * Get restaurant details by ID
 */
const getRestaurantById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        return res.status(200).json({ success: true, data: restaurant });
    }
    catch (error) {
        console.error('Error fetching restaurant:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.getRestaurantById = getRestaurantById;
/**
 * Create a new restaurant
 */
const createRestaurant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurantData = req.body;
        const restaurant = new restaurant_model_1.Restaurant(restaurantData);
        yield restaurant.validate();
        yield restaurant.save();
        return res.status(201).json({ success: true, data: restaurant });
    }
    catch (error) {
        console.error('Error creating restaurant:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.createRestaurant = createRestaurant;
/**
 * Update restaurant details
 */
const updateRestaurant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        return res.status(200).json({ success: true, data: restaurant });
    }
    catch (error) {
        console.error('Error updating restaurant:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.updateRestaurant = updateRestaurant;
/**
 * Check if restaurant is currently open
//  */
// export const checkRestaurantOpen = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }
//     const restaurant = await Restaurant.findById(id);
//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }
//     const isOpen = restaurant.isOpen();
//     return res.status(200).json({
//       success: true,
//       data: {
//         isOpen,
//         currentDay: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
//         hours: restaurant.operatingHours
//       }
//     });
//   } catch (error) {
//     console.error('Error checking restaurant status:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };
// ==========================================
// Menu Management Controllers
// ==========================================
/**
 * Get restaurant's complete menu
 */
const getRestaurantMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id, 'name menu');
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        return res.status(200).json({
            success: true,
            data: {
                restaurantName: restaurant.name,
                menu: restaurant.menu
            }
        });
    }
    catch (error) {
        console.error('Error fetching menu:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.getRestaurantMenu = getRestaurantMenu;
/**
 * Add a new menu category
 */
const addMenuCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const categoryData = req.body;
        const categoryId = categoryData === null || categoryData === void 0 ? void 0 : categoryData.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        const existingCategoryIndex = restaurant.menu.findIndex(c => c.id === categoryData.id);
        if (existingCategoryIndex !== -1) {
            // Category exists, append new items
            const existingCategory = restaurant.menu[existingCategoryIndex];
            const newItems = categoryData.items || [];
            // Filter out items with duplicate IDs
            const existingItemIds = new Set(existingCategory.items.map(item => item.id));
            const uniqueNewItems = newItems.filter((item) => !existingItemIds.has(item.id));
            if (uniqueNewItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'All item IDs already exist in this category'
                });
            }
            // Append unique new items to the existing category
            restaurant.menu[existingCategoryIndex].items.push(...uniqueNewItems);
            yield restaurant.save();
            return res.status(200).json({
                success: true,
                message: 'New items added to existing category',
                updatedCategory: restaurant.menu[existingCategoryIndex]
            });
        }
        else {
            // Category does not exist — create new category
            restaurant.menu.push(categoryData);
            yield restaurant.save();
            return res.status(201).json({
                success: true,
                message: 'New menu category added successfully',
                newCategory: categoryData
            });
        }
    }
    catch (error) {
        console.error('Error adding or updating menu category:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.addMenuCategory = addMenuCategory;
/**
 * Update an existing menu category
//  */
// export const updateMenuCategory = async (req: Request, res: Response) => {
//   try {
//     const { restaurantId, categoryId } = req.params;
//     const updateData = req.body;
//     if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }
//     const restaurant = await Restaurant.findById(restaurantId);
//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }
//     const categoryIndex = restaurant.menu.findIndex(c => c.id === categoryId);
//     if (categoryIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: `Category with ID ${categoryId} not found`
//       });
//     }
//     // Preserve items if not provided in update
//     if (!updateData.items) {
//       updateData.items = restaurant.menu[categoryIndex].items;
//     }
//     restaurant.menu[categoryIndex] = {
//       ...restaurant.menu[categoryIndex].toObject(),
//       ...updateData
//     };
//     await restaurant.save();
//     return res.status(200).json({
//       success: true,
//       data: restaurant.menu[categoryIndex],
//       message: 'Menu category updated successfully'
//     });
//   } catch (error : any) {
//     console.error('Error updating menu category:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ success: false, message: error.message });
//     }
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };
/**
 * Delete a menu category
 */
const deleteMenuCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurantId, categoryId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        const categoryIndex = restaurant.menu.findIndex(c => c.id === categoryId);
        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `Category with ID ${categoryId} not found`
            });
        }
        restaurant.menu.splice(categoryIndex, 1);
        yield restaurant.save();
        return res.status(200).json({
            success: true,
            message: 'Menu category deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting menu category:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.deleteMenuCategory = deleteMenuCategory;
/**
 * Add a menu item to a category
 */
const addMenuItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurantId, categoryId } = req.params;
        const itemData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        const categoryIndex = restaurant.menu.findIndex(c => c.id === categoryId);
        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `Category with ID ${categoryId} not found`
            });
        }
        // Check if item ID already exists in this category
        const existingItem = restaurant.menu[categoryIndex].items.find(i => i.id === itemData.id);
        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: `Item with ID ${itemData.id} already exists in this category`
            });
        }
        restaurant.menu[categoryIndex].items.push(itemData);
        yield restaurant.save();
        return res.status(201).json({
            success: true,
            data: itemData,
            message: 'Menu item added successfully'
        });
    }
    catch (error) {
        console.error('Error adding menu item:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.addMenuItem = addMenuItem;
/**
 * Update a menu item
//  */
const updateMenuItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurantId, itemId } = req.params;
        const updateData = req.body;
        console.log(restaurantId);
        if (!mongoose_1.default.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        const categoryIndex = restaurant.menu.findIndex((c) => {
            console.log(c.id);
            if (c.id === updateData.categoryId) {
                console.log("found");
                return c.id;
            }
        });
        if (categoryIndex === -1) {
            return res.status(404).json({ success: false, message: `Category with ID ${updateData.categoryId} not found` });
        }
        const itemIndex = restaurant.menu[categoryIndex].items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: `Item with ID ${itemId} not found in this category` });
        }
        console.log('Original item:', restaurant.menu[categoryIndex].items[itemIndex]);
        console.log('Update data received:', updateData);
        // Remove categoryId from updateData as it's not a property of the menu item itself
        // It's used for routing but shouldn't be saved in the item object
        const { categoryId: receivedCategoryId } = updateData, cleanUpdateData = __rest(updateData, ["categoryId"]);
        // Update the item properties
        restaurant.menu[categoryIndex].items[itemIndex] = Object.assign(Object.assign(Object.assign({}, restaurant.menu[categoryIndex].items[itemIndex]), cleanUpdateData), { id: itemId // Ensure ID remains unchanged
         });
        console.log('Updated item:', restaurant.menu[categoryIndex].items[itemIndex]);
        // Save the updated restaurant document
        yield restaurant.save();
        return res.status(200).json({
            success: true,
            data: restaurant.menu[categoryIndex].items[itemIndex],
            message: 'Menu item updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating menu item:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.updateMenuItem = updateMenuItem;
/**
 * Delete a menu item
 */
const deleteMenuItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurantId, categoryId, itemId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        const categoryIndex = restaurant.menu.findIndex(c => c.id === categoryId);
        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `Category with ID ${categoryId} not found`
            });
        }
        const itemIndex = restaurant.menu[categoryIndex].items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `Item with ID ${itemId} not found in this category`
            });
        }
        restaurant.menu[categoryIndex].items.splice(itemIndex, 1);
        yield restaurant.save();
        return res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting menu item:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.deleteMenuItem = deleteMenuItem;
/**
 * Get popular menu items
//  */
// export const getPopularItems = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }
//     const restaurant = await Restaurant.findById(id);
//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }
//     const popularItems = restaurant.getPopularItems();
//     return res.status(200).json({
//       success: true,
//       data: popularItems
//     });
//   } catch (error : any) {
//     console.error('Error fetching popular items:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };
// ==========================================
// Table Management Controllers
// ==========================================
/**
 * Get all tables for a restaurant
 */
const getRestaurantTables = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id, 'tables');
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        return res.status(200).json({
            success: true,
            data: restaurant.tables
        });
    }
    catch (error) {
        console.error('Error fetching tables:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.getRestaurantTables = getRestaurantTables;
/**
 * Add a new table to the restaurant
 */
const addRestaurantTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const tableData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        // Check if table number already exists
        const existingTable = restaurant.tables.find(t => t.tableNumber === tableData.tableNumber);
        if (existingTable) {
            return res.status(400).json({
                success: false,
                message: `Table with number ${tableData.tableNumber} already exists`
            });
        }
        // Add new table
        restaurant.tables.push(Object.assign(Object.assign({}, tableData), { status: 'available', currentOrder: undefined }));
        yield restaurant.save();
        return res.status(201).json({
            success: true,
            data: restaurant.tables[restaurant.tables.length - 1],
            message: 'Table added successfully'
        });
    }
    catch (error) {
        console.error('Error adding table:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.addRestaurantTable = addRestaurantTable;
/**
 * Update a table's information
 */
const updateRestaurantTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, tableId } = req.params;
        const updateData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        const tableIndex = restaurant.tables.findIndex(t => t.tableNumber === tableId);
        if (tableIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `Table with number ${tableId} not found`
            });
        }
        // Update table data
        restaurant.tables[tableIndex] = Object.assign(Object.assign(Object.assign({}, restaurant.tables[tableIndex]), updateData), { tableNumber: tableId // Ensure table number remains unchanged
         });
        yield restaurant.save();
        return res.status(200).json({
            success: true,
            data: restaurant.tables[tableIndex],
            message: 'Table updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating table:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.updateRestaurantTable = updateRestaurantTable;
/**
 * Delete a table from the restaurant
 */
const deleteRestaurantTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, tableId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        const tableIndex = restaurant.tables.findIndex(t => t.tableNumber === tableId);
        if (tableIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `Table with number ${tableId} not found`
            });
        }
        // Check if table is occupied
        if (restaurant.tables[tableIndex].status === 'occupied') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete an occupied table'
            });
        }
        // Remove table
        restaurant.tables.splice(tableIndex, 1);
        yield restaurant.save();
        return res.status(200).json({
            success: true,
            message: 'Table deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting table:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.deleteRestaurantTable = deleteRestaurantTable;
/**
 * Update a table's status
 */
const updateTableStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, tableId } = req.params;
        const { status, orderId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        const tableIndex = restaurant.tables.findIndex(t => t.tableNumber === tableId);
        if (tableIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `Table with number ${tableId} not found`
            });
        }
        // Update table status
        restaurant.tables[tableIndex].status = status;
        // Only update orderId if it's provided
        if (orderId) {
            if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({ success: false, message: 'Invalid order ID format' });
            }
            restaurant.tables[tableIndex].currentOrder = new mongoose_1.default.Types.ObjectId(orderId);
        }
        yield restaurant.save();
        return res.status(200).json({
            success: true,
            message: 'Table status updated successfully',
            data: restaurant.tables[tableIndex]
        });
    }
    catch (error) {
        console.error('Error updating table status:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.updateTableStatus = updateTableStatus;
// ==========================================
// POS-Specific Controllers
// ==========================================
/**
 * Search menu items across all categories
 */
const searchMenuItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { query } = req.query;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        const searchTerm = String(query).toLowerCase();
        const results = [];
        restaurant.menu.forEach(category => {
            const matchedItems = category.items.filter(item => item.name.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)));
            matchedItems.forEach(item => {
                results.push({
                    item,
                    category: category.name
                });
            });
        });
        return res.status(200).json({
            success: true,
            data: results
        });
    }
    catch (error) {
        console.error('Error searching menu items:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.searchMenuItems = searchMenuItems;
/**
 * Get quick stats for the restaurant dashboard
 */
// export const getRestaurantStats = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
//     }
//     const restaurant = await Restaurant.findById(id);
//     if (!restaurant) {
//       return res.status(404).json({ success: false, message: 'Restaurant not found' });
//     }
//     // Count tables by status
//     const tableStats = {
//       total: restaurant.tables.length,
//       available: restaurant.tables.filter(t => t.status === 'available').length,
//       occupied: restaurant.tables.filter(t => t.status === 'occupied').length,
//       reserved: restaurant.tables.filter(t => t.status === 'reserved').length,
//       maintenance: restaurant.tables.filter(t => t.status === 'maintenance').length
//     };
//     // Count menu items by category
//     const menuStats = restaurant.menu.map(category => ({
//       category: category.name,
//       itemCount: category.items.length
//     }));
//     // Calculate menu diversity
//     const totalItems = restaurant.menu.reduce((sum, category) => sum + category.items.length, 0);
//     return res.status(200).json({
//       success: true,
//       data: {
//         isOpen: restaurant.isOpen(),
//         tableStats,
//         menuStats,
//         totalItems,
//         totalCategories: restaurant.menu.length,
//         averageRating: restaurant.averageRating,
//         reviewCount: restaurant.reviewCount
//       }
//     });
//   } catch (error : any) {
//     console.error('Error fetching restaurant stats:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };
/**
 * Export full menu data (for printing, PDF generation, etc.)
 */
const exportMenuData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id, 'name description priceRange menu');
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        // Process menu data for export
        const processedMenu = restaurant.menu.map(category => {
            const items = category.items.map(item => ({
                name: item.name,
                description: item.description || '',
                price: item.price,
                isVegetarian: item.isVegetarian || false,
                isVegan: item.isVegan || false,
                isGlutenFree: item.isGlutenFree || false,
                allergens: item.allergens || [],
                spicyLevel: item.spicyLevel || 0
            }));
            return {
                name: category.name,
                description: category.description || '',
                items
            };
        });
        const exportData = {
            restaurantName: restaurant.name,
            description: restaurant.description,
            priceRange: restaurant.priceRange,
            exportDate: new Date(),
            menu: processedMenu
        };
        return res.status(200).json({
            success: true,
            data: exportData
        });
    }
    catch (error) {
        console.error('Error exporting menu data:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.exportMenuData = exportMenuData;
/**
 * Get available menu items by category (optimized for POS ordering)
 */
const getAvailableMenuByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
        }
        const restaurant = yield restaurant_model_1.Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        // Filter menu to only include available items within each category
        const availableMenu = restaurant.menu.map(category => ({
            id: category.id,
            name: category.name,
            items: category.items.filter(item => item.available !== false)
        }));
        return res.status(200).json({
            success: true,
            data: availableMenu
        });
    }
    catch (error) {
        console.error('Error fetching available menu:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});
exports.getAvailableMenuByCategory = getAvailableMenuByCategory;
/**
 * Batch update multiple menu items (e.g., mark items as unavailable)
 */
/**
 * Process payment for an order
 * @route POST /api/v1/payments/process
 * @access Public
 */
const processPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency, paymentMethod, cardDetails } = req.body;
        // Validate required fields
        if (!amount || !currency || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Amount, currency, and payment method are required',
            });
        }
        // Validate payment method
        const validPaymentMethods = ['cash', 'card', 'wallet', 'qr', 'room'];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method',
            });
        }
        // Validate card details if payment method is card
        if (paymentMethod === 'card') {
            if (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
                return res.status(400).json({
                    success: false,
                    message: 'Card details are required for card payment',
                });
            }
            // Basic card validation
            if (cardDetails.cardNumber.replace(/\s/g, '').length < 14) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid card number',
                });
            }
        }
        // In a real application, you would integrate with a payment gateway like Stripe or PayPal here
        // For this dummy implementation, we'll simulate a payment response
        // Generate unique IDs for the transaction
        const paymentId = (0, uuid_1.v4)();
        const transactionId = `TXN-${Date.now()}`;
        // Simulate API call delay
        yield new Promise(resolve => setTimeout(resolve, 1000));
        // Create a payment record in the database (pseudocode)
        // const payment = await Payment.create({
        //   paymentId,
        //   transactionId,
        //   amount,
        //   currency,
        //   paymentMethod,
        //   status: 'completed',
        //   timestamp: new Date(),
        // });
        // Return success response with payment details
        return res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                paymentId,
                transactionId,
                amount,
                currency,
                status: 'completed',
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Payment processing error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
exports.processPayment = processPayment;
/**
 * Get payment details
 * @route GET /api/v1/payments/:paymentId
 * @access Private
 */
const getPaymentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentId } = req.params;
        // Find order with matching payment ID
        const order = yield restaurant_model_1.Order.findOne({ 'payment.transactionId': paymentId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                payment: order.payment,
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status
            }
        });
    }
    catch (error) {
        console.error('Error fetching payment:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
exports.getPaymentDetails = getPaymentDetails;
/**
 * Create a new order
 * @route POST /api/v1/orders
 * @access Public
 */
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { customer, items, tableNumber, type, specialInstructions, paymentMethod } = req.body;
        const { restaurantId } = req.params;
        // Validate required fields
        if (!restaurantId || !customer || !items || !type) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        // Calculate order totals
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        // Create order with initial payment status
        const order = new restaurant_model_1.Order({
            restaurantId,
            orderNumber: `ORD-${Date.now()}`,
            customer,
            items,
            tableNumber,
            status: restaurant_model_1.OrderStatus.PENDING,
            type: restaurant_model_1.OrderType.DINE_IN,
            subtotal,
            tax,
            total,
            payment: {
                method: paymentMethod.toLowerCase() || restaurant_model_1.PaymentMethod.CASH,
                status: restaurant_model_1.PaymentStatus.PENDING,
                amount: total,
                tax,
                tip: 0
            },
            specialInstructions,
            orderDate: new Date(),
            estimatedReadyTime: new Date(Date.now() + 30 * 60000) // 30 minutes from now
        });
        yield order.save();
        // Update restaurant's active orders
        const restaurant = yield restaurant_model_1.Restaurant.findById(restaurantId);
        if (restaurant) {
            (_a = restaurant.activeOrders) === null || _a === void 0 ? void 0 : _a.push(order._id);
            yield restaurant.save();
        }
        return res.status(201).json({
            success: true,
            data: order
        });
    }
    catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.createOrder = createOrder;
/**
 * Get all orders for a restaurant
 * @route GET /api/v1/orders
 * @access Private
 */
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurantId } = req.query;
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID is required',
            });
        }
        const orders = yield restaurant_model_1.Order.find({ restaurantId })
            .sort({ orderDate: -1 })
            .populate('restaurantId', 'name');
        return res.status(200).json({
            success: true,
            data: orders
        });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
exports.getOrders = getOrders;
/**
 * Get order by ID
 * @route GET /api/v1/orders/:orderId
 * @access Private
 */
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }
        const order = yield restaurant_model_1.Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: order
        });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.getOrderById = getOrderById;
/**
 * Update order status
 * @route PATCH /api/v1/orders/:orderId/status
 * @access Private
 */
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const { status, paymentDetails } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }
        // Validate status
        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status',
            });
        }
        const order = yield restaurant_model_1.Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        // If payment details are provided, update payment information
        if (paymentDetails) {
            order.payment = Object.assign(Object.assign(Object.assign({}, order.payment), paymentDetails), { paymentDate: new Date() });
        }
        // Update order status
        order.status = status;
        if (status === restaurant_model_1.OrderStatus.COMPLETED) {
            order.completedTime = new Date();
            // Update payment status to completed if not already set
            if (order.payment.status === restaurant_model_1.PaymentStatus.PENDING) {
                order.payment.status = restaurant_model_1.PaymentStatus.PAID;
            }
        }
        yield order.save();
        // If order is completed or cancelled and it was a dine-in order, update table status
        if ((status === restaurant_model_1.OrderStatus.COMPLETED || status === restaurant_model_1.OrderStatus.CANCELLED) && order.type === restaurant_model_1.OrderType.DINE_IN && order.tableNumber) {
            const restaurant = yield restaurant_model_1.Restaurant.findById(order.restaurantId);
            if (restaurant) {
                const tableIndex = restaurant.tables.findIndex(t => t.tableNumber === order.tableNumber);
                if (tableIndex !== -1) {
                    restaurant.tables[tableIndex].status = 'available';
                    restaurant.tables[tableIndex].currentOrder = undefined;
                    yield restaurant.save();
                }
            }
        }
        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    }
    catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while updating order status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
exports.updateOrderStatus = updateOrderStatus;
/**
 * Delete an order
 * @route DELETE /api/v1/orders/:orderId
 * @access Private
 */
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { orderId } = req.params;
        const order = yield restaurant_model_1.Order.findByIdAndDelete(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        // Remove order from restaurant's active orders
        const restaurant = yield restaurant_model_1.Restaurant.findById(order.restaurantId);
        if (restaurant) {
            restaurant.activeOrders = (_b = restaurant.activeOrders) === null || _b === void 0 ? void 0 : _b.filter((id) => !id.equals(order._id));
            yield restaurant.save();
        }
        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting order:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.deleteOrder = deleteOrder;
const getRestaurantOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurantId } = req.params;
        const { status, type } = req.query;
        let query = { restaurantId };
        if (status)
            query.status = status;
        if (type)
            query.type = type;
        const orders = yield restaurant_model_1.Order.find(query)
            .sort({ orderDate: -1 });
        return res.status(200).json({
            success: true,
            data: orders
        });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
exports.getRestaurantOrders = getRestaurantOrders;
// Configure AWS
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const s3 = new aws_sdk_1.default.S3();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
});
// Image upload handler
const uploadMenuItemImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const file = req.file;
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `menu-items/${(0, uuid_1.v4)()}.${fileExtension}`;
        console.log({
            AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
            AWS_REGION: process.env.AWS_REGION,
        });
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME, // <-- notice the !
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read',
        };
        const result = yield s3.upload(uploadParams).promise();
        res.status(200).json({
            success: true,
            data: {
                imageUrl: result.Location
            }
        });
    }
    catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image'
        });
    }
});
exports.uploadMenuItemImage = uploadMenuItemImage;
