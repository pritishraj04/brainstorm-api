import mongoose from "mongoose";

import User from "./models/Users.js";
import { config } from "dotenv";

config();

const mongoURI = process.env.DB_URI;

const updateProductdatabase = async () => {
  try {
    await mongoose.connect(mongoURI);
    const users = await User.find({});
    console.log(users);

    // User.updateMany({}, { $unset: { role: 1 } });
    // console.log("User updated successfully");
    // console.log(users);
  } catch (error) {
    console.log(error.message);
  } finally {
    // Close the connection to the database
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// updateProductdatabase();
