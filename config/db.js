import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    const connection = await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      }
    );

    console.log("✅ MongoDB Connected");
    console.log(
      "🌐 MongoDB Host:",
      connection.connection.host
    );

    return connection;

  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(error.message);

    throw error;
  }
};

export default connectDB;