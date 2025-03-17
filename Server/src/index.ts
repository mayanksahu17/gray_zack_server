import dotenv from 'dotenv'
import {app} from './app'

import connectdb from "./db/index";
dotenv.config({path: './env'})

connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
        app.on("error",(error  : any)=>{console.log("Error : ",error); throw error ;} )
    })
})
.catch((error : any)=>{
console.log("MONGO db connection failed: " + error);
})