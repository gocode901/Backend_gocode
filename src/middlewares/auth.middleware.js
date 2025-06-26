import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
export const verifyJwt= asyncHandler(async(req,_,next)=>{
    try {
    //   console.log("Cookies:", req.cookies); // Check all cookies
         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        if (!token) {
            throw new ApiError(401, "unauthorized access request")   
        }
        const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "invalid token access")
        }
        
    req.user=user;
    next()     // important for the middleware execution and the next one function
    } 
    catch (error) {
      throw new ApiError(401, error.message || "Unauthorized access");
    }
})