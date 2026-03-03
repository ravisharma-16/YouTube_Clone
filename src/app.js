import express from 'express'  // express are use to conversation of request and response
import cookieParser from 'cookie-parser'
import cors from 'cors'  // cors are used to easy to excess a data url and ..

const app = express()

//  dont allow of another domines
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true // 🔴 This is REQUIRED to allow cookies
}))


// api data limite
app.use(express.json({limit:"16kb"}))
// url me jo + - ka symbol hote hai wo sub ke lea hai 
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

app.use(cookieParser()); // help to create a cookies

// import routes 

import router from "./routes/user.routes.js"

app.use("/api/v1/users",router)
// http://localhost:8000/api/v1/users/register

export {app}