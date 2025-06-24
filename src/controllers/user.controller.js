import asyncHandler from "../utils/asyncHandler.js"

const registerUser= asyncHandler(async (req, res)=>{
   try {
    res.status(200).json({ message: "User registered" });
  } catch (error) {
    next(error);
  }
})

export default registerUser