import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  // db is in the other continent
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\nmongoDb cnnected !! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(" mongoDB connection Failed", error);
    process.exit(1);
  }
};
export default connectDB;
