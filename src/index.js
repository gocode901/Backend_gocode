// require('dotenv').config({ path: "./env"})
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js"

// -r dotenv/config --experimental-json-modules
// we need to add this in package.json/ nodemon 

dotenv.config({
  path: "./env"
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
    process.exit(1);
})


// function connectDB() {}
// connectDB();      //calling the function immediately

// or

// (function connectDB(){})();
// or

// ********
// this is the "iife(immediately invoked function expression)" approach where we have the connection code itself in the index file and other approach will be writing the connection code separately in db file

/*
import express from "express";
const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("Error", (error) => {
      console.log("Error: ", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on the Port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error("Error :", error);
    throw error;
  }
})();
*/
