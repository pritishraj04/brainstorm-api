import { Schema, model } from "mongoose";
import Joi from "joi";

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

// Validation
export const createCategoryValidation = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  description: Joi.string().min(3).max(500),
});

export const updateCategoryValidation = Joi.object({
  name: Joi.string().min(3).max(20),
  description: Joi.string().min(3).max(500),
});

const Category = model("Category", categorySchema);

export default Category;
