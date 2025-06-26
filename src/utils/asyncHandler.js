// by promises wrapper for execution function

const asyncHandler=(fn)=>{
   return (req, res, next)=>{
        Promise.resolve( fn(req,res,next)).catch((err)=>next(err))
    }
};

export {asyncHandler} // its a higher order function


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
