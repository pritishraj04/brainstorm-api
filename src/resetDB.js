import mongoose from "mongoose";
import { config } from "dotenv";

import Category from "./models/Category.js";
import Product from "./models/Product.js";
import Coupon from "./models/Coupon.js";
import Counter from "./models/Counter.js";

config();
// Connection to your MongoDB database
const mongoURI = process.env.DB_URI; // Replace with your MongoDB URI

const resetDatabase = async () => {
  try {
    // Connect to the database
    await mongoose.connect(mongoURI);

    console.log("Connected to the database");

    // Get a list of all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    // Drop all collections except the 'users' collection
    for (let collection of collections) {
      if (collection.name !== "users") {
        await mongoose.connection.db.dropCollection(collection.name);
        console.log(`Dropped collection: ${collection.name}`);
      }
    }

    // add a new category named other
    const category = await Category.create({
      name: "Other",
      description: "All other products",
    });

    const product = new Product({
      name: "Glaze cake",
      description: "A luxurious glaze cake perfect for special occasions.",
      tags: ["cake", "dessert", "glaze"],
      specifications: ["Available in two sizes: $99 and $119"],
      basePrice: 99.0,
      sellingPrice: 119.0,
      costToCompany: 75.0,
      category: category._id,
      stock: 15,
      active: true,
    });
    const createdProduct = await product.save();

    await Category.findOneAndUpdate(
      category._id,
      { $push: { products: createdProduct._id } },
      { new: true }
    );

    const initialCoupons = [
      {
        code: "DISCOUNT10",
        discount: 10,
        discountPriceLimit: 5,
        usageLimit: 10,
        expirationDate: new Date("2025-12-31"),
      },
      {
        code: "DISCOUNT20",
        discount: 20,
        discountPriceLimit: 10,
        usageLimit: 5,
        expirationDate: new Date("2025-12-31"),
      },
    ];

    // Insert initial coupons
    await Coupon.insertMany(initialCoupons);
    console.log("Inserted initial coupons");

    // If you're using a Counter for order numbers, reset it to start fresh
    await Counter.findOneAndUpdate(
      { _id: "orderNumber" },
      { seq: 0 },
      { upsert: true, new: true }
    );
    console.log("Reset order counter");

    console.log("Database reset complete");
  } catch (error) {
    console.error("Error resetting the database:", error);
  } finally {
    // Close the connection to the database
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

resetDatabase();
