import mongoose from "mongoose";
import { DB_NAME } from "./constants";

// function connectDB() {}
// connectDB();

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
      console.log(`App is listening on the Port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error :", error);
    throw error;
  }
})();
*/
