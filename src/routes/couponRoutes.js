import { Router } from "express";
import Coupon, {
  createCouponValidation,
  updateCouponValidation,
} from "../models/Coupon.js";
import validate from "../middleware/validationMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import roleAuth from "../middleware/allowedRole.js";

const router = new Router();

// @route GET /api/v1/coupons/
// @desc Get a list of coupons
// @access Public

router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find({});

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Server error", err: error.message });
  }
});

// @route POST /api/v1/coupons/
// @desc Create a new coupon
// @access Private

router.post(
  "/",
  protect,
  roleAuth(["user", "admin"]),
  validate(createCouponValidation),
  async (req, res) => {
    try {
      const { code, discount, discountPriceLimit, usageLimit, expirationDate } =
        req.body;
      const isCouponExist = await Coupon.findOne({ code });
      if (isCouponExist) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      const newCoupon = new Coupon({
        code,
        discount,
        discountPriceLimit,
        usageLimit,
        expirationDate,
      });
      await newCoupon.save();
      res.status(201).json(newCoupon);
    } catch (error) {
      res.status(500).json({ message: "Server error", err: error.message });
    }
  }
);

// @route PATCH /api/v1/coupons/:id
// @desc Update a coupon
// @access Private
// @param {string} id

router.patch(
  "/:id",
  protect,
  roleAuth(["user", "admin"]),
  validate(updateCouponValidation),
  async (req, res) => {
    try {
      const { code, discount, discountPriceLimit, usageLimit, expirationDate } =
        req.body;
      const isCouponExist = await Coupon.findOne({ code });
      if (isCouponExist && isCouponExist._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        { code, discount, discountPriceLimit, usageLimit, expirationDate },
        { new: true }
      );
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Server error", err: error.message });
    }
  }
);

// @route DELETE /api/v1/coupons/:id
// @desc Delete a coupon
// @access Private
// @param {string} id

router.delete(
  "/:id",
  protect,
  roleAuth(["user", "admin"]),
  async (req, res) => {
    try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", err: error.message });
    }
  }
);

export default router;
