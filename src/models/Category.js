import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

const Category = model("Category", categorySchema);

export default Category;
