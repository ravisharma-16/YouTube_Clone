import dotenv from 'dotenv'
import connectDB from "./db/DB_connection.js";
import {app} from "./app.js"

dotenv.config({
    path :'./env'
})

connectDB()


.then(() =>
{

    
    app.listen(process.env.PORT || 3000,() =>{
        console.log(`server are running of port : ${process.env.PORT}`);
    })
})
.catch((error) =>
{
    console.log("error of mongoose !! : ",error);
})













// databass connection
/*
import express from "express"
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error) =>{
            console.log("error of mongoose",error)
            throw error
        })

        app.listen(process.env.PORT,() => {
            console.log(`app was listing of port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("error : ",error)
        throw error
    }
})()

*/