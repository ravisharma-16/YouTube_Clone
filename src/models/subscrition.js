import mongoose from "mongoose";

const subscriptionschema = new mongoose.Schema({
    subscription :
    {
        type : mongoose.Schema.Types.ObjectId,    
        ref : "User"
    },
    channel :
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
},{timestamps:true})

export const subscriptions = mongoose.model("subscriptions",subscriptionschema)