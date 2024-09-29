import mongoose from "mongoose";
import { config } from "dotenv";

import Product from "./models/Product.js"; // Import your product model
import Coupon from "./models/Coupon.js"; // Import your coupon model
import Counter from "./models/Counter.js"; // If you're using counter for order number

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

    // OPTIONAL: Repopulate the database with initial data (e.g., for products, coupons, etc.)
    const initialProducts = [
      {
        name: "Glaze cake",
        description: "A luxurious glaze cake perfect for special occasions.",
        tags: ["cake", "dessert", "glaze"],
        specifications: ["Available in two sizes: $99 and $119"],
        basePrice: 99.0,
        sellingPrice: 119.0,
        costToCompany: 75.0,
        category: "Food",
        stock: 15,
        active: true,
      },
      {
        name: "Red velvet",
        description: "Delicious red velvet cake, rich in flavor.",
        tags: ["cake", "dessert", "red velvet"],
        specifications: ["Available in multiple sizes: $59 and $139"],
        basePrice: 59.0,
        sellingPrice: 139.0,
        costToCompany: 45.0,
        category: "Food",
        stock: 10,
        active: true,
      },
      {
        name: "Brownie cake",
        description: "A rich and decadent brownie cake.",
        tags: ["cake", "dessert", "brownie"],
        specifications: ["Available in multiple sizes: $99 and $229"],
        basePrice: 99.0,
        sellingPrice: 229.0,
        costToCompany: 85.0,
        category: "Food",
        stock: 12,
        active: true,
      },
      {
        name: "Salted caramel cake",
        description: "Delicious salted caramel cake with a creamy finish.",
        tags: ["cake", "dessert", "salted caramel"],
        specifications: ["Available in multiple sizes: $199 and $399"],
        basePrice: 199.0,
        sellingPrice: 399.0,
        costToCompany: 150.0,
        category: "Food",
        stock: 8,
        active: true,
      },
      {
        name: "Strawberry cake",
        description: "A fresh and fruity strawberry cake.",
        tags: ["cake", "dessert", "strawberry"],
        specifications: ["Price: $29.00"],
        basePrice: 29.0,
        sellingPrice: 29.0,
        costToCompany: 20.0,
        category: "Food",
        stock: 20,
        active: true,
      },
      {
        name: "Pink mousse cake",
        description: "A delightful pink mousse cake with a smooth texture.",
        tags: ["cake", "dessert", "mousse"],
        specifications: ["Original price: $39.00, Discounted price: $32.00"],
        basePrice: 39.0,
        sellingPrice: 32.0,
        costToCompany: 25.0,
        category: "Food",
        stock: 18,
        active: true,
      },
      {
        name: "Blueberry cheesecake",
        description: "A creamy blueberry cheesecake.",
        tags: ["cake", "dessert", "blueberry"],
        specifications: ["Price: $19.00"],
        basePrice: 19.0,
        sellingPrice: 19.0,
        costToCompany: 12.0,
        category: "Food",
        stock: 25,
        active: true,
      },
      {
        name: "Blueberry mousse",
        description: "A smooth blueberry mousse dessert.",
        tags: ["dessert", "mousse", "blueberry"],
        specifications: ["Price: $12.00"],
        basePrice: 12.0,
        sellingPrice: 12.0,
        costToCompany: 8.0,
        category: "Food",
        stock: 0, // Out of stock
        active: true,
      },
      {
        name: "Raspberry cheesecake",
        description: "A fresh raspberry cheesecake dessert.",
        tags: ["cake", "dessert", "raspberry"],
        specifications: ["Price: $39.00"],
        basePrice: 39.0,
        sellingPrice: 39.0,
        costToCompany: 30.0,
        category: "Food",
        stock: 15,
        active: true,
      },
      {
        name: "Dark chocolate candy",
        description: "Rich dark chocolate candy.",
        tags: ["candy", "chocolate", "dessert"],
        specifications: ["Price: $29.00"],
        basePrice: 29.0,
        sellingPrice: 29.0,
        costToCompany: 20.0,
        category: "Food",
        stock: 30,
        active: true,
      },
      {
        name: "Caramel candy",
        description: "Soft caramel candy.",
        tags: ["candy", "caramel", "dessert"],
        specifications: ["Price: $39.00"],
        basePrice: 39.0,
        sellingPrice: 39.0,
        costToCompany: 28.0,
        category: "Food",
        stock: 22,
        active: true,
      },
      {
        name: "Coconut candy",
        description: "Sweet coconut-flavored candy.",
        tags: ["candy", "coconut", "dessert"],
        specifications: ["Price: $19.00"],
        basePrice: 19.0,
        sellingPrice: 19.0,
        costToCompany: 14.0,
        category: "Food",
        stock: 10,
        active: true,
      },
    ];

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

    // Insert initial products
    await Product.insertMany(initialProducts);
    console.log("Inserted initial products");

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
