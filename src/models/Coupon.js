import { Schema, model } from "mongoose";
import Joi from "joi";

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

// TODO add support for one-time in a day usage limit per customer

// Validation
export const createCouponValidation = Joi.object({
  code: Joi.string()
    .regex(/^[A-Z][A-Z0-9-_]{3,20}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Coupon code must be 6-20 characters long, must start with an alphabet and can only include capital letters, numbers, dashes (-), and underscores (_).",
      "string.empty": "Coupon code is required.",
      "any.required": "Coupon code is required.",
    }),
  discount: Joi.number().min(0).max(100).required(),
  discountPriceLimit: Joi.number().min(0).max(10000).required(),
  usageLimit: Joi.number().optional().default(Infinity),
  expirationDate: Joi.date()
    .custom((value, helpers) => {
      const now = new Date();
      const midnightNextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // Add one day
        0,
        0,
        0,
        0 // Set to midnight
      );
      console.log(midnightNextDay);
      console.log(value);

      if (value < midnightNextDay) {
        return helpers.message(
          `Expiration date must be at least midnight of ${midnightNextDay.toLocaleDateString()}`
        );
      }

      return value; // Pass validation
    })
    .required()
    .messages({
      "date.base": "Expiration date must be a valid date.",
      "any.required": "Expiration date is required.",
    }),
  isActive: Joi.boolean().optional().default(true),
});
export const updateCouponValidation = Joi.object({
  code: Joi.string().min(3).max(20),
  discount: Joi.number().min(0).max(100),
  discountPriceLimit: Joi.number().min(0).max(10000),
  usageLimit: Joi.number().optional().default(Infinity),
  expirationDate: Joi.date()
    .greater(Date.now() + 24 * 60 * 60 * 1000) // At least 24 hours from now
    .custom((value, helpers) => {
      const now = new Date();
      const midnightNextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // Add one day
        0,
        0,
        0,
        0 // Set to midnight
      );

      if (value < midnightNextDay) {
        return helpers.message(
          `Expiration date must be at least midnight of ${midnightNextDay.toLocaleDateString()}`
        );
      }

      return value; // Pass validation
    })

    .messages({
      "date.base": "Expiration date must be a valid date.",
    }),
  isActive: Joi.boolean().optional(),
});

// TODO: Date is not working properly

const Coupon = model("Coupon", CouponSchema);

export default Coupon;
