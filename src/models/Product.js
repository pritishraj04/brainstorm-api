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
      type: String,
      enum: ["Food", "Beverage", "Other"],
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

const Product = model("Product", productSchema);

export default Product;
