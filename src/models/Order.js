import { model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    couponCode: String,
    discount: Number,
    totalAmount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: function () {
        return this.paymentStatus === "Paid";
      },
    },
    note: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    shippingMethod: {
      type: String,
      enum: ["Standard", "Express", "Priority"],
      default: "Standard",
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash On Delivery", "Card", "UPI"],
      default: "Cash On Delivery",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    comments: [
      {
        comment: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Order = model("Order", orderSchema);

export default Order;
