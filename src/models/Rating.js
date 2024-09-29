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

const Rating = model("Rating", RatingSchema);

export default Rating;
