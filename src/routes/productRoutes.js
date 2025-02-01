import { Router } from "express";
import Product, {
  createProductValidation,
  updateProductValidation,
} from "../models/Product.js";
import Category from "../models/Category.js";
import protect from "../middleware/authMiddleware.js";
import roleAuth from "../middleware/allowedRole.js";
import validate from "../middleware/validationMiddleware.js";

const router = Router();

// @route GET /api/v1/products
// @desc  Get all products
// @access Public

router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route POST /api/v1/products
// @desc  Create a product
// @access Private

router.post(
  "/",
  protect,
  roleAuth(["user", "admin"]),
  validate(createProductValidation),
  async (req, res) => {
    try {
      const {
        name,
        description,
        basePrice,
        sellingPrice,
        costToCompany,
        categoryId,
        images,
        tags,
        specifications,
      } = req.body;

      const isProductExist = await Product.findOne({ name });

      if (isProductExist) {
        return res
          .status(400)
          .json({ message: "Product with this name already exist" });
      }

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const product = new Product({
        name,
        description,
        basePrice,
        sellingPrice,
        costToCompany,
        category: categoryId,
        images,
        tags,
        specifications,
      });

      const createdProduct = await product.save();

      await Category.findByIdAndUpdate(
        categoryId,
        { $push: { products: createdProduct._id } },
        { new: true }
      );
      res.status(201).json(createdProduct);
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

// @route PATCH /api/v1/products/:id
// @desc  update a product field except the name field
// @access Private

router.patch(
  "/:id",
  protect,
  roleAuth(["user", "admin"]),
  validate(updateProductValidation),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.name) {
        return res
          .status(400)
          .json({ message: "You cannot update the procuct name" });
      }
      if (updates.rating) {
        return res
          .status(400)
          .json({ message: "You cannot directly update the procuct rating" });
      }

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (updates.category) {
        const category = await Category.findById(updates.category);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
        // remove the product from the category and update the product in the new category
        await Category.findByIdAndUpdate(
          product.category,
          { $pull: { products: product._id } },
          { new: true }
        );
        await Category.findByIdAndUpdate(
          updates.category,
          { $push: { products: product._id } },
          { new: true }
        );
        product.category = updates.category;
      }

      Object.keys(updates).forEach((key) => {
        product[key] = updates[key];
      });

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

// @route DELETE /api/v1/products/:id
// @desc Delete a product
// @access Private
// @param {string} id

router.delete(
  "/:id",
  protect,
  roleAuth(["user", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Delete product id from category
      await Category.findByIdAndUpdate(
        product.category,
        { $pull: { products: product._id } },
        { new: true }
      );

      await Product.deleteOne({ _id: id });

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

export default router;
