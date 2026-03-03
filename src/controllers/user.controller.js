import {asyncfunction} from "../utils/asyncfunction.js"
import {ApiError} from "../utils/Api_error.js"
import {User} from "../models/User.js"
import {uploadoncloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/Api_response.js"
import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose"


const generateAccessTokenandRefreshToken = async(UserId) =>
{
    try {
        const user = await User.findById(UserId)
        const refreshToken = user.generateRefreshToken()
        const AccessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        user.save({validBeforeSave : false})
        return {AccessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something want wrong to generate refresh and Access token")
    }
}

const registerUser = asyncfunction( async (req,res) => 
{
    // res.status(200).json({
    //     message : "bilkul chal raha hai"
    // })

    // get user details from frontend
   // validation -- not empty
   // check if user already exists : name ,email
   // check for image , or avatar
   // upload them to cloudinary,avatar
   // create user object -- create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return response


    // user details
   const {username,email,fullname,password} = req.body
//    console.log("email : ",email);

    // check any field are not empty
 if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
}



    // already exists : name , email
    const alreadyexist = await User.findOne({$or : [{ username },{ email }] } )
    if(alreadyexist)
    {
        throw new ApiError(409,"user already exist")
    }

    // upload a avatar or coverImage local storage

    const avatarlocalstorage = req.files?.avatar[0]?.path
    // const coverImagelocalstorage = req.files?.coverImage[0]?.path

    let coverImagelocalstorage;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght > 0)
    {
        coverImagelocalstorage = req.files.coverImage[0].path
    }

    if(!avatarlocalstorage)
    {
        throw new ApiError(400,"Avatar file is required")
    }
    
    //uploading into cloudinary
    const Avatar = await uploadoncloudinary(avatarlocalstorage)
    const Coverimage = await uploadoncloudinary(coverImagelocalstorage)
    if(!Avatar)
    {
        throw new ApiError(400,"Avatar file is required")
    }

    // create a user in Database
   const new_user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    avatar: Avatar.url,
    coverImage: Coverimage?.url || ""
  });

    // check user are uploaded on DB
    const createuser = await User.findById(new_user._id).select("-password -refreshToken")
    if(!createuser)
    {
        throw new ApiError(500,"Something want wrong while register")
    }
    return res.status(200).json(
        new ApiResponse(200,createuser,"user register successfully")
    )

})

const loginUser = asyncfunction(async(req,res) =>
{
    // req body -> data
    // username and email check
    // find the user
    //password check
    // access and refersh token
    //send cookie

    const {email,username,password} = req.body

    if(!username && !email)
    {
        throw new ApiError(400,"please fill username or email")
    }

    const USER = await User.findOne({$or:[{username},{email}]})

    if (!USER) {
        throw new ApiError(404,"User does not exist")
    }

    //check passwork are correct or not
    const ispasswordvalid = await USER.isPasswordCorrect(password)

    if(!ispasswordvalid)
    {
        throw new ApiError(401,"User password is not correct")
    }

    // create a refesh or access token
    const {refreshToken,AccessToken} = await generateAccessTokenandRefreshToken(USER._id)

    const logginedUser = await User.findById(USER._id).select("-password -refreshToken")

    // secure cookies not a change a frotend
    const option = {httpOnly : true,secure:true}
    // create cookies
    return res.status(200).cookie("refreshToken",refreshToken,option).cookie("AccessToken",AccessToken,option).json(new ApiResponse(200,{user : logginedUser,AccessToken,refreshToken},
        "User logging successfully"
    ))
})

const logout = asyncfunction(async(req,res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set : { refreshToken : undefined }
  }, { new : true });

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("AccessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshaccesstoken = asyncfunction(async(req,res) =>
{
    const incomingrefreshtoken = req.cookie.refreshToken || req.body.refreshToken
    if (!incomingrefreshtoken) {
        throw new ApiError(401,"aunotherized request")
    }

    const decoded = jsonwebtoken.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)

    try {
        const user = await User.findById(decoded?._id)
        if (!user) {
            throw new ApiError(401,"invalid token")
        }
    
        if (incomingrefreshtoken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const option =
        {
            httpOnly:true,
            secure:true
        }
    
        const {AccessToken,newrefreshToken} = await generateAccessTokenandRefreshToken(user._id)
    
        return res.status(200).cookie("refreshToken",newrefreshToken,option).cookie("AccessToken",AccessToken,option).json(new ApiResponse(200,{user : AccessToken, refreshToken : newrefreshToken},
            "Access Token refreshed"
        ))
    } catch (error) {
        throw new ApiError(401,error?.message  || "invalid refresh token")
    } 
})


const changecurrentpassword = asyncfunction(async(req,res) =>
{
    const {oldpassword,newpassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldpassword)

    if(!isPasswordCorrect)
    {
        throw new ApiError(400,"invalid old password")
    }
    user.password = newpassword

    user.save({validBeforeSave:false})
    return res.status(200).json(new ApiResponse(200,{},"user change password successfully"))
})

const getcurrentuser = asyncfunction(async(req,res) =>
{
    return res.status(200).json(new ApiResponse(200,req.user,"user fetched successfully"))
})

const updateAccountDetails = asyncfunction(async(req,res) =>
{
    const {fullname,email} = req.body
    if(!fullname || !email)
    {
        throw new ApiError(400,"all field are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{$set : {fullname : fullname,email : email}},{new : true}).select("-password")
    return res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvater = asyncfunction(async(req,res) =>
{
    const avaterlocalpath = req.file?.path
    if (!avaterlocalpath) {
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar = await uploadoncloudinary(avaterlocalpath)
    if (!avatar.url) {
        throw new ApiError(400,"uploading cloudinary fail Avatar")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,{$set : {avatar : avatar.url}},{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"avatar uplode successfully"))
})


const updateUserCoverImage = asyncfunction(async(req,res) =>
{
    const coverImagelocalpath = req.file?.path
    if (!coverImagelocalpath) {
        throw new ApiError(400,"coverImage file is missing")
    }
    const coverImage = await uploadoncloudinary(coverImagelocalpath)
    if (!coverImage.url) {
        throw new ApiError(400,"uploading cloudinary fail coverImage")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,{$set : {coverImage : coverImage.url}},{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"coverImage uplode successfully"))
})

const getUserChannelProfile = asyncfunction(async(req,res) =>
{
    // get a username from the URL parameters
    const {username} = req.params

    if(!username?.trim())
    {
        throw new ApiError(400,"username is missing")
    }

    // pipeline
    const channels =  await User.aggregate([
        { $match : {username : username?.toLowerCase()}},
        {
            $lookup : 
             //  models                 find by id                 kya dhundana hai         name kya rakhana hai
            {from : "subscriptions",localField : "_id",foreignField : "channel", as : "subscribers"} // kis or ne subscribe kys hai
        },
        {
            $lookup : 
            //  models                 find by id                 kya dhundana hai         name kya rakhana hai
            {from : "subscriptions",localField : "_id",foreignField : "subscription", as : "subscribedTo"} // jisi mene subscribe kya hai
        },
        {
            $addFields : 
            {
                //  count how many subscribe you
            subscriberCount :
            {
                $size : "$subscribers"
            },
            //  count how many subscribe me
            subscribeToAs :
            {
                $size : "$subscribedTo"
            },
            //  giving a true or false value subscribe or not
            issubscribed :
            {
                $cond : 
                {
                    if : {$in : [req.user?._id,"$subscribers.subscription"]},
                    then : true,
                    else : false
                }
            }
            }
        },
        {
            $project :  // user ko kya kya send krna hai
            {
                subscribeToAs : 1,
                subscriberCount : 1,
                fullname : 1,
                username : 1,
                issubscribed : 1,
                email : 1,
                avatar : 1,
                coverImage : 1,

            }
        }
    ])

    if (!channels?.length()) {
        throw new ApiError(404,"channels dose not exist")
    }

    return res.status(200).json(new ApiResponse(200,channels[0],"user channels fetched successfully"))
})

const getWatchHistory = asyncfunction(async (req,res) =>
{
    const user = await User.aggregate([
        {
            $match : {_id : new mongoose.Types.ObjectId(req.user._id)}
        },
        {
            $lookup:
            {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "WatchHistory",
                pipeline : [   // nested
                    {
                        $lookup : 
                        {
                            from : "users",
                            localField : "Owner",
                            foreignField : "_id",
                            as : "Owner",
                            pipeline : [
                                {
                                    $project : 
                                    {
                                        username : 1,
                                        fullname : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields :
                        {
                            owner :{$first : "$Owner"}
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"watch history fetch successfully"));
})

export {registerUser,loginUser,logout,refreshaccesstoken,
    changecurrentpassword,getcurrentuser,
    updateAccountDetails,updateUserAvater,
    updateUserCoverImage,getUserChannelProfile,getWatchHistory}