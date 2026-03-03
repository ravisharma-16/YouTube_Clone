// import mongoose from "mongoose";  // are used to database 
// import { DB_NAME } from "../constant.js";

// const connectDB = async ()=>
// {
//     try {
//         const connectingDB = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         console.log(`\n ✅ databass connecting mongoose !! DB HOST : ${connectingDB.connection.host}`);
//     } catch (error) {
//         console.error(" ❌ error of connection of mongoose : ",error);
//         process.exit(1);
//     }
// }

// export default connectDB

// connectDB.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectingDB = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`✅ MongoDB Connected: ${connectingDB.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
