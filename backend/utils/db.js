import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL || 10),
      minPoolSize: Number(process.env.MONGO_MIN_POOL || 0),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT || 5000),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT || 45000),
    });
    console.log(`MongoDB Connection Successfully`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
