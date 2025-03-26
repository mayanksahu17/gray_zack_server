import express, { Express, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app: Express = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN as string,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(cookieParser());



import adminRouter from './routes/administratorRoutes/admin.route'
import hotelAdminRouter from './routes/admin.hotel.route'
import staffRouter from './routes/staff.route'
import restaurantRouter from './routes/restaurant.route'

app.use('/api/v1.0/admin',adminRouter)
app.use('/api/v1/admin/hotels', hotelAdminRouter)
app.use('/api/v1/staff/hotel', staffRouter)
app.use('/api/v1/restaurant', restaurantRouter)



























// import roomRouter from './routes/room.routes'
// app.use('/api/v1/admin/hotel',hotelRouter)
// app.use()
// app.use('hii',async ( res : Response) => {
//     res.status(200).json({
//         message : "hii"
//     })
// })


export { app };
