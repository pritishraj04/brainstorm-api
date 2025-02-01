import Joi from "joi";
import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    tags: [String],
    specifications: [String],
    basePrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    costToCompany: {
      type: Number,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: { type: Number, required: true, default: 0 },
    active: { type: Boolean, default: true, required: true },
    images: [
      {
        imgurl: { type: String, required: true },
        isCover: { type: Boolean, default: false, required: true },
      },
    ],
    ratings: [{ type: Schema.Types.ObjectId, ref: "Rating" }],
    avgRating: { type: Number, min: 0, max: 5, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

// validation

export const createProductValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255),
  tags: Joi.array().items(Joi.string()).min(1).max(10),
  specifications: Joi.array().items(Joi.string()),
  basePrice: Joi.number().min(0).required(),
  sellingPrice: Joi.number().min(0).required(),
  costToCompany: Joi.number().min(0).required(),
  category: Joi.string().required(),
  stock: Joi.number().min(0).required(),
  active: Joi.boolean().required(),
  images: Joi.array().items(
    Joi.object({
      imgurl: Joi.string().required(),
      isCover: Joi.boolean().required(),
    })
  ),
});

export const updateProductValidation = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().max(255),
  tags: Joi.array().items(Joi.string()).min(1).max(10),
  specifications: Joi.array().items(Joi.string()),
  basePrice: Joi.number().min(0),
  sellingPrice: Joi.number().min(0),
  costToCompany: Joi.number().min(0),
  category: Joi.string(),
  stock: Joi.number().min(0),
  active: Joi.boolean(),
  images: Joi.array().items(
    Joi.object({
      imgurl: Joi.string(),
      isCover: Joi.boolean(),
    })
  ),
});

const Product = model("Product", productSchema);

export default Product;
