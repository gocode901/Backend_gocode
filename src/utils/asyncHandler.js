// by promises wrapper for execution function

const asyncHandler=( requestHandler)=>{
   return (req, res, next)=>{
        Promise.resolve( requestHandler(req,res,next)).catch((err)=>next(err))
    }
};

export default asyncHandler


//   by try and catch   wrapper for execution function

// const asynHandler=(fn)=> async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code||400).json({
//             success: false,
//             message: error.message,
//         })
//     }
// }



// const asynHandler=()=>{}
// const asynHandler=()=>(()=>{})
// const asynHandler=()=>()=>{}
// const asynHandler=(fn)=>()=>{}         higher order function
