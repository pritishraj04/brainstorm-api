import { Router } from "express";
import Product from "../models/Product.js";
import { protectUser } from "../middleware/authMiddleware.js";
import roleAuth from "../middleware/allowedRole.js";

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
router.post("/", protectUser, roleAuth(["user"]), async (req, res) => {
  try {
    const {
      name,
      description,
      basePrice,
      sellingPrice,
      costToCompany,
      category,
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

    const product = new Product({
      name,
      description,
      basePrice,
      sellingPrice,
      costToCompany,
      category,
      images,
      tags,
      specifications,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route PATCH /api/v1/products/:id
// @desc  update a product field except the name field
// @access Private
router.patch("/:id", protectUser, roleAuth(["user"]), async (req, res) => {
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

    Object.keys(updates).forEach((key) => {
      product[key] = updates[key];
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

export default router;
