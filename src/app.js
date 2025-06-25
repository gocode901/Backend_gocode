import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app=express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRouter from "./routes/user.route.js"

// routes declaration

// app.use("/users", userRouter)
app.use("/api/v1/users",userRouter)

// https://localhost:8000/api/v1/users/registerUser


export {app} ;


// // test.js
// import express from 'express';
// const app = express();

// app.get('/', (req, res) => {
//   res.send('Hello World');
// });

// app.listen(8000, '0.0.0.0', () => {
//   console.log("Test server running on 8000");
// });

// export default app

