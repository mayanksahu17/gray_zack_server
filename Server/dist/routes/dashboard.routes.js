"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_data_controller_1 = require("../controller/dashboard.data.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/dashboard/dashboard:
 *   get:
 *     summary: Get dashboard data for the hotel admin panel
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 */
router.get('/dashboard', dashboard_data_controller_1.getDashboardData);
exports.default = router;
