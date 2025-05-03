"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const whitelist = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://gray-zack-113j.vercel.app',
    'https://gray-zack.vercel.app',
    'http://16.171.47.60:3000',
    'http://16.171.47.60:3001',
    'http://16.171.47.60:3002',
    'http://16.171.47.60:3003',
    'http://16.171.47.60:3004'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin || whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true); // Allow all origins in development
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    exposedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: "16kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "16kb" }));
app.use(express_1.default.static("public"));
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});
const admin_route_1 = __importDefault(require("./routes/administratorRoutes/admin.route"));
const admin_hotel_route_1 = __importDefault(require("./routes/admin.hotel.route"));
const staff_route_1 = __importDefault(require("./routes/staff.route"));
const restaurant_route_1 = __importDefault(require("./routes/restaurant.route"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const guest_route_1 = __importDefault(require("./routes/guest.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
const invoice_route_1 = __importDefault(require("./routes/invoice.route"));
const reservation_route_1 = __importDefault(require("./routes/reservation.route"));
const booking_route_1 = __importDefault(require("./routes/booking.route"));
const roomService_route_1 = __importDefault(require("./routes/roomService.route"));
const checkout_route_1 = __importDefault(require("./routes/checkout.route"));
const analytics_route_1 = __importDefault(require("./routes/analytics.route"));
const report_route_1 = __importDefault(require("./routes/report.route"));
const overview_payment_route_1 = __importDefault(require("./routes/overview.payment.route"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const search_route_1 = __importDefault(require("./routes/search.route"));
app.use('/api/v1.0/admin', admin_route_1.default);
app.use('/api/v1/admin/hotels', admin_hotel_route_1.default);
app.use('/api/v1/staff/hotel', staff_route_1.default);
app.use('/api/v1/room', room_routes_1.default);
app.use('/api/v1/admin/hotel/restaurant', restaurant_route_1.default);
app.use('/api/restaurants', restaurant_route_1.default);
app.use('/api/v1/guest', guest_route_1.default);
app.use('/api/v1/payment', payment_route_1.default);
app.use('/api/v1/invoice', invoice_route_1.default);
app.use('/api/v1/reservation', reservation_route_1.default);
app.use('/api/v1/booking', booking_route_1.default);
app.use('/api/v1/room-service', roomService_route_1.default);
app.use('/api/v1/overview/payments', overview_payment_route_1.default);
app.use('/api/v1/checkout', checkout_route_1.default);
app.use('/api/v1/analytics', analytics_route_1.default);
app.use('/api/v1/hotel', admin_hotel_route_1.default);
app.use('/api/v1/reports', report_route_1.default);
app.use('/api', dashboard_routes_1.default);
app.use('/api/search', search_route_1.default);
exports.default = app;
