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
exports.deleteOrder = exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = exports.createOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const restaurant_model_1 = require("../models/restaurant.model");
const uuid_1 = require("uuid");
/**
 * Create a new order
 */
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurantId, items, subtotal, tax, discount, total, diningOption, tableNumber, paymentMethod, customerDetails, specialInstructions } = req.body;
        // Validate required fields
        if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID and at least one item are required'
            });
        }
        if (!subtotal || !total || !diningOption || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required order details'
            });
        }
        // Validate dining option
        if (diningOption === restaurant_model_1.OrderType.DINE_IN && !tableNumber) {
            return res.status(400).json({
                success: false,
                message: 'Table number is required for dine-in orders'
            });
        }
        // Validate customer details for delivery
        if (diningOption === restaurant_model_1.OrderType.DELIVERY) {
            if (!customerDetails || !customerDetails.name || !customerDetails.phone || !customerDetails.address) {
                return res.status(400).json({
                    success: false,
                    message: 'Customer details are required for delivery orders'
                });
            }
        }
        // Generate unique IDs
        const orderId = (0, uuid_1.v4)();
        const orderNumber = `ORD-${Date.now()}`;
        // Create new order
        const order = new restaurant_model_1.Order({
            restaurantId,
            orderNumber,
            customer: customerDetails,
            items,
            tableNumber,
            status: restaurant_model_1.OrderStatus.PENDING,
            type: diningOption,
            subtotal,
            tax,
            discount,
            total,
            payment: {
                method: paymentMethod,
                status: restaurant_model_1.PaymentStatus.PENDING,
                amount: total,
                tax
            },
            specialInstructions,
            orderDate: new Date(),
            estimatedReadyTime: new Date(Date.now() + 20 * 60000) // 20 minutes from now
        });
        yield order.save();
        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                orderId: order._id,
                orderNumber,
                status: order.status,
                estimatedReadyTime: order.estimatedReadyTime
            }
        });
    }
    catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.createOrder = createOrder;
/**
 * Get all orders
 */
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurantId, status, startDate, endDate } = req.query;
        const query = {};
        if (restaurantId) {
            query.restaurantId = restaurantId;
        }
        if (status) {
            query.status = status;
        }
        if (startDate && endDate) {
            query.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const orders = yield restaurant_model_1.Order.find(query)
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.getAllOrders = getAllOrders;
/**
 * Get order by ID
 */
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }
        const order = yield restaurant_model_1.Order.findById(id).populate('restaurantId', 'name');
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
            message: 'An error occurred while fetching the order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.getOrderById = getOrderById;
/**
 * Update order status
 */
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }
        if (!status || !Object.values(restaurant_model_1.OrderStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required'
            });
        }
        const order = yield restaurant_model_1.Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.updateOrderStatus = updateOrderStatus;
/**
 * Delete order
 */
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format'
            });
        }
        const order = yield restaurant_model_1.Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
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
            message: 'An error occurred while deleting the order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.deleteOrder = deleteOrder;
