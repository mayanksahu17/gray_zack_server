import express, { Express, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {setupSwagger} from './swagger'
const app: Express = express();
const whitelist = [
  'http://localhost:3000',
  // 'http://localhost:3001',
  // 'http://localhost:3002',
  'http://13.53.43.124:3000',
  // 'https://gray-zack-113j.vercel.app',
  // 'https://gray-zack.vercel.app',
  // 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin || whitelist.indexOf(origin!) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true); // Allow all origins in development
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.use(express.static("public"));
app.use(cookieParser());
app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
});

import adminRouter from './routes/administratorRoutes/admin.route'
import hotelAdminRouter from './routes/admin.hotel.route'
import staffRouter from './routes/staff.route'
import restaurantRouter from './routes/restaurant.route'
import roomRoutes from './routes/room.routes'
import guestRoutes from './routes/guest.route'
import paymentRoutes from "./routes/payment.route"
import invoiceRouter from './routes/invoice.route'
import reservationRoutes from './routes/reservation.route'
import bookingRoutes from './routes/booking.route'
import roomServiceRoutes from './routes/roomService.route'
import checkoutRoutes from './routes/checkout.route'
import analyticsRoutes from './routes/analytics.route'
import reportRoutes from './routes/report.route'
import overviewPaymentRoutes from './routes/overview.payment.route'
import dashboardRoutes from './routes/dashboard.routes'
import searchRoutes from './routes/search.route'
// import { setupSwagger } from './swagger';

app.use('/api/v1.0/admin', adminRouter)
app.use('/api/v1/admin/hotels', hotelAdminRouter)
app.use('/api/v1/staff/hotel', staffRouter)
app.use('/api/v1/room', roomRoutes)
app.use('/api/v1/admin/hotel/restaurant', restaurantRouter)
app.use('/api/restaurants', restaurantRouter)
app.use('/api/v1/guest', guestRoutes)
app.use('/api/v1/payment', paymentRoutes)
app.use('/api/v1/invoice', invoiceRouter)
app.use('/api/v1/reservation', reservationRoutes)
app.use('/api/v1/booking', bookingRoutes)
app.use('/api/v1/room-service', roomServiceRoutes)
app.use('/api/v1/overview/payments', overviewPaymentRoutes)
app.use('/api/v1/checkout', checkoutRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/v1/hotel', hotelAdminRouter)
app.use('/api/v1/reports', reportRoutes)
app.use('/api', dashboardRoutes)
app.use('/api/search', searchRoutes)
setupSwagger(app);

export default app
