import chalk from "chalk";
import mongoose from "mongoose";

const checkConnectionDB = async () => {
  try {
    const uri = process.env.DB_URI;
    const result = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(result.models);
    console.log(chalk.bgGreen("Database connection successful"));
  } catch (error) {
    console.error(chalk.bgRed("Database connection failed"), error);
  }
};

export default checkConnectionDB;
