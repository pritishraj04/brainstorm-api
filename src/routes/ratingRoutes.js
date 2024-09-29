import { Router } from "express";
import Rating from "../models/Rating.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import { protectCustomer } from "../middleware/authMiddleware.js";
import roleAuth from "../middleware/allowedRole.js";

const router = Router();

// @route GET /api/v1/ratings
// @desc  Get all ratings
// @access Public

router.get("/", async (req, res) => {
  try {
    const ratings = await Rating.find({});
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route POST /api/v1/ratings
// @desc Create a new rating
// @access Private

router.post("/", protectCustomer, roleAuth(["customer"]), async (req, res) => {
  try {
    const { productId, customerId, rating, comment } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    if (!rating) {
      return res.status(400).json({ message: "Rating must be provided" });
    }

    const existingRating = await Rating.findOne({
      product: productId,
      customer: customerId,
    });
    let savedRating;

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
      savedRating = await existingRating.save();
    } else {
      const newRating = new Rating({
        customer: customerId,
        product: productId,
        rating,
        comment,
      });

      savedRating = await newRating.save();

      if (!savedRating) {
        return res
          .status(400)
          .json({ message: "There was an error saving the rating" });
      }
      // Update product rating array with current rating
      product.ratings.push(savedRating._id);
    }

    const allRatings = await Rating.find({ product: productId });
    const totalRatings = allRatings.length;
    const totalRatingSum = allRatings.reduce(
      (acc, rating) => acc + rating.rating,
      0
    );
    const averageRating = totalRatingSum / totalRatings;
    product.avgRating = averageRating;

    await product.save();
    res.status(201).json(savedRating);
  } catch (error) {
    res.status(500).json({ message: "Server error", err: error.message });
  }
});

export default router;
