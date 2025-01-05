import { Router } from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import protect from "../middleware/authMiddleware.js";
import roleAuth from "../middleware/allowedRole.js";

const router = new Router();

// @route GET /api/v1/categories
// @desc  Get all categories
// @access Public

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route POST /api/v1/categories
// @desc  Create a new category
// @access Private

router.post("/", protect, roleAuth(["user", "admin"]), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Please provide name and description" });
    }
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    const newCategory = new Category({ name, description });
    const category = await newCategory.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route PATCH /api/v1/categories/:id
// @desc update a category except the name field
// @access Private
// @param {string} id

router.patch(
  "/:id",
  protect,
  roleAuth(["user", "admin"]),
  async function (req, res) {
    try {
      const { id } = req.params; // Current category ID
      const { name, description, products } = req.body;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Update category name and description if provided
      if (name) category.name = name;
      if (description) category.description = description;

      await category.save();

      // Handle product updates
      if (products && Array.isArray(products)) {
        for (const { productId, newCategoryId } of products) {
          //only proceed when params id and newCategoryId are not same
          if (id === newCategoryId) {
            continue;
          }

          // Check if both product and new category exist
          if (!productId || !newCategoryId) {
            return res.status(400).json({
              message: "Please provide both product ID and new category ID",
            });
          }

          const product = await Product.findById(productId);

          if (!product) {
            return res
              .status(404)
              .json({ message: `Product with ID ${productId} not found` });
          }

          const newCategory = await Category.findById(newCategoryId);

          if (!newCategory) {
            return res
              .status(404)
              .json({ message: `Category with ID ${newCategoryId} not found` });
          }

          // Update the product's category
          product.category = newCategoryId;
          await product.save();

          // Remove the product from the current category's products array
          await Category.findByIdAndUpdate(
            id,
            { $pull: { products: productId } },
            { new: true }
          );

          // Add the product to the new category's products array
          await Category.findByIdAndUpdate(
            newCategoryId,
            { $addToSet: { products: productId } },
            { new: true }
          );
        }
      }

      // Refetch the updated category to ensure correct products array
      const updatedCategory = await Category.findById(id).populate("products");

      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

// @route DELETE /api/v1/categories/:id
// @desc Delete a category
// @access Private
// @param {string} id

router.delete(
  "/:id",
  protect,
  roleAuth(["user", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const products = await Product.find({ category: id });
      if (products.length > 0) {
        return res
          .status(400)
          .json({ message: "Cannot delete category with products" });
      }

      await Category.deleteOne({ _id: id });
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

export default router;
