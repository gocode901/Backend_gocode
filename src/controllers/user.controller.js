import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import  {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req, res)=>{

          
    const {username, fullname, email, password}= req.body
    // console.log("email " , email);

    // if(fullname===""){
    //     throw new ApiError(400, "fullname is required")
    // }

    if(
        [username, fullname, email, password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser= await User.findOne({
        $or : [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with this email or username already exist")
    }

    const avatarLocalPath= req.files?.avatar[0]?.path
    const coverImageLocalPath= req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    } 

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage = coverImageLocalPath 
        ? await uploadOnCloudinary(coverImageLocalPath) 
        : null;

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const user= await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url||null,
        password,
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering user")
    } 
    
    return res.status(201).json(
        new ApiResponse(200, createdUser,"User registered successfully ")
    )

    //  return res.status(200).json({ message: "User registered" }); 
})



export default registerUser