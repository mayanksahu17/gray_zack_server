"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("../controller/search.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Perform a unified search across entities like guests, rooms, and bookings
 *     tags: [Search]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: Search term
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results retrieved
 */
router.get('/', search_controller_1.unifiedSearch);
exports.default = router;
