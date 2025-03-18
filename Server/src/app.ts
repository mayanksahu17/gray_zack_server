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



import adminRouter from './routes/adminRoutes/admin.route'


app.use('/api/v1.0/admin',adminRouter)



























// import roomRouter from './routes/room.routes'
// import hotelRouter from './routes/admin.hotel.route'

// app.use('/api/v1/room',roomRouter)
// app.use('/api/v1/admin/hotel',hotelRouter)
// app.use()
// app.use('hii',async ( res : Response) => {
//     res.status(200).json({
//         message : "hii"
//     })
// })


export { app };
