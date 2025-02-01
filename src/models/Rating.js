import Joi from "joi";
import { Schema, model } from "mongoose";

const RatingSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, min: 0, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

// validation
export const createRatingValidation = Joi.object({
  customer: Joi.string().required(),
  product: Joi.string().required(),
  rating: Joi.number().min(0).max(5).required(),
  comment: Joi.string(),
});

const Rating = model("Rating", RatingSchema);

export default Rating;
