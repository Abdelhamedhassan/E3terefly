import mongoose from "mongoose";

const checkConnectionDB = async () => {
  try {
    const uri = process.env.DB_URI;
    const result = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(result.models);
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

export default checkConnectionDB;
