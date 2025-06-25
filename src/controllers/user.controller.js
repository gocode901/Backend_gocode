import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser = asyncHandler(async (req, res)=>{
    console.log("hii buddy")
     return res.status(200).json({ message: "User registered" }); 
})

export default registerUser