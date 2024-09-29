import { Schema, model } from "mongoose";

const CouponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  discountPriceLimit: {
    type: Number,
    required: true,
    min: 0,
    max: 10000,
  },
  usageLimit: {
    type: Number,
    default: Infinity,
  },
  expirationDate: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Coupon = model("Coupon", CouponSchema);

export default Coupon;
