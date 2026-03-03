import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"; // it was the use of password increpet
import jsonwebtoken from "jsonwebtoken";

const UserSchema = new Schema({
    username :{
        type : String,
        required : true,
        lowercase : true,
        index : true,
        unique : true,
        trim : true
    },
    email :{
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim : true
    },
    fullname :{
        type : String,
        required : true,
        index : true,
        trim : true
    },
    avatar :{
        type : String,  // cloudinary url
        required : true,
    },
    coverImage :{
        type : String
    },
    watchHistory :[
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password :{
        type : String,
        required : [true,"Password is required"]
    },
    refreshToken :{
        type : String
    }
},{timestamps : true})

UserSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)  // password incrript
    next()
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)   // user and incrript compare
}

UserSchema.methods.generateAccessToken = function ()
{
    return jsonwebtoken.sign(
        {
            _id : this._id,
            username : this.username,
            fullname:this.fullname,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.generateRefreshToken = function () 
{
    return jsonwebtoken.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",UserSchema)