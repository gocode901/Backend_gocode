import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import  {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user= await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
    //    console.log(accessToken,refreshToken)
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "something went wrong while generation access and refresh tokens")
    }
}

const registerUser = asyncHandler(async (req, res)=>{

    // console.log(req);
    // console.log(req.route);
    
    
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
    // const coverImageLocalPath= req.files?.coverImage[0]?.path

    // here for checking the value of coverImage
    // to handle the error ( cannot read the properties of the undefined(reading "0"))
    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

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

const loginUser = asyncHandler( async (req, res )=>{
    // req.body ->data
    //verify the user  by email or username and check the password
    // generate refresh/ access token 
    // send cookies and give the access

    const { username, email, password} = req.body;

    if(!(email||username)){
        throw new ApiError(400, "username or email is required")
    }

    const user= await User.findOne({
        $or:[{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "user does not existed")
    }

    const isPasswordValid= await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "invalid user credentials")
    }

    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const cookieOptions ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken,cookieOptions)
    .cookie("refreshToken", refreshToken,cookieOptions)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "user loggedIn successfully"
        )
    )

})

const logOutUser= asyncHandler(async(req,res)=>{
//  we create a middleware to get access of user._id  and the user from User in req
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{accessToken:undefined}
        },
        {
            new:true
        }
    )
    const cookieOptions ={
        httpOnly:true,
        secure:true
    }
     return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken=req.cookie.refreshToken||req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(400, "unauthorized request"
        )
    }

 try {
       const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
       const user = await User.findById(decodedToken?._id)
       if(!user){
           throw new ApiError(400, "invalid refresh token")
       }
   
       if(incomingRefreshToken!==user?.refreshToken){
           throw new ApiError(400, "Refresh token is expired or used !!")
       }
   
       const cookieOptions={
           httpOnly:true,
           secure: true
       }
       const {accessToken,refreshToken} =await generateAccessAndRefreshToken(user._id)
       return res
       .status(200)
       .cookie("accessToken",accessToken,cookieOptions)
       .cookie("refreshToken",refreshToken,cookieOptions)
       .json(
           new ApiResponse(
               200,
               {
                 accessToken,refreshToken
               },
               "Access token refreshed"
           )
       )
 } 
  catch (error) {
    throw new ApiError(401,error.message || "invalid user token")
 }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body;

    const user=await User.findById(req.user._id)
    const isPasswordCorrect =await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
       throw new ApiError(400," old password is incorrect ") 
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
    new ApiResponse(
        200,
        {},
        "NEW PASSWORD IS CHANGED SUCCESSFULLY "
    )
    )
})

const getCurrentUser= asyncHandler(async(req,res)=>{
    return res.json(
        new ApiResponse(
            200,
            req.user,
            "user fatched successfully"
        )
    )
})

const updateAccountDetails= asyncHandler(async (req, res)=>{
    const {fullname, email} =req.body;
    if (!fullname || !email) {
       throw new ApiError(400,"All fields are required") 
    }
    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email
            }
        },
        {
            new:true
        }
    ).select("-password")
    
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Successfully updated the account"  
    ))
})

const updateUserAvatar = asyncHandler( async (req,res)=>{
      const avatarLocalPath =req.file?.path

      if(!avatarLocalPath){
       throw new ApiError(400,"Avatar is missing") 
      }

      const avatar= await uploadOnCloudinary(avatarLocalPath)
      if(!avatar.url){
       throw new ApiError(400,"Error while uploading on avatar") 
      }
      const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
      ).select("-password")
      return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            user,
            "Avatar is updated successfully"
        )
      )
})
const updateUserCoverImage = asyncHandler( async (req,res)=>{
      const CoverImageLocalPath =req.file?.path

      if(!CoverImageLocalPath){
       throw new ApiError(400,"CoverImage is missing") 
      }

      const CoverImage= await uploadOnCloudinary(CoverImageLocalPath)
      if(!CoverImage.url){
       throw new ApiError(400,"Error while uploading on CoverImage") 
      }
      const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                CoverImage:CoverImage.url
            }
        },
        {
            new:true
        }
      ).select("-password")
      return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            user,
            "CoverImage is updated successfully"
        )
      )
})
export {registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} 