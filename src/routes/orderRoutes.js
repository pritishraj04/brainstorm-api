import { Router } from "express";
import { protectUser, protectCustomer } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import applyCoupon from "../utils/applyCoupon.js";
import getNextOrderNumber from "../utils/getNextOrderNumber.js";
import roleAuth from "../middleware/allowedRole.js";

const router = new Router();

const ALLOWED_ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const ALLOWED_PAYMENT_STATUSES = ["Pending", "Paid", "Failed"];

// @route GET /api/v1/orders
// @desc  Get all orders
// @access Private
router.get("/", protectUser, roleAuth(["user"]), async (req, res) => {
  try {
    const orders = await Order.find({});

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route POST /api/v1/orders
// @desc  Create an order
// @access Private
router.post(
  "/",
  protectCustomer,
  roleAuth(["user", "customer"]),
  async (req, res) => {
    try {
      const {
        customerId,
        items,
        address,
        shippingMethod,
        shippingCost,
        paymentMethod,
        transactionId,
        note,
        couponCode,
      } = req.body;

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      let totalAmount = 0;
      const orderItems = [];
      const productsToUpdate = [];
      for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product) {
          return res
            .status(404)
            .json({ message: `Product with ID ${item.productId} not found` });
        }

        if (product.stock < item.quantity) {
          return res
            .status(400)
            .json({ message: `Not enough stock for product: ${product.name}` });
        }

        const price = Number(product.sellingPrice);
        const quantity = Number(item.quantity);

        if (isNaN(price) || isNaN(quantity)) {
          return res.status(400).json({ message: "Invalid price or quantity" });
        }

        if (shippingCost && isNaN(shippingCost)) {
          return res.status(400).json({ message: "Invalid shipping cost" });
        }

        const itemTotal = price * quantity;
        totalAmount += itemTotal;
        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: itemTotal,
        });

        productsToUpdate.push(product);
      }

      // logic for coupon
      let discount = 0;
      let finalAmount = totalAmount;

      if (couponCode) {
        try {
          const { discountAmount, newTotal } = await applyCoupon(
            couponCode,
            totalAmount
          );

          discount = discountAmount;
          finalAmount = newTotal;
        } catch (error) {
          return res.status(400).json({ message: error.message });
        }
      }

      for (const item of orderItems) {
        const product = productsToUpdate.find((p) =>
          p._id.equals(item.product)
        );
        product.stock -= item.quantity;
        await product.save();
      }

      const orderNumber = await getNextOrderNumber();

      const newOrder = new Order({
        customer: customer._id,
        items: orderItems,
        totalAmount: finalAmount,
        couponCode,
        shippingMethod,
        shippingCost,
        paymentMethod,
        discount,
        status: "Pending",
        paymentStatus: "Pending",
        comments: [...comments, { comment: "Order is placed" }],
        orderNumber,
        transactionId,
        note,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
      });

      await newOrder.save();

      if (couponCode) {
        await Coupon.updateOne(
          { code: couponCode },
          { $inc: { usageLimit: -1 } }
        );
      }

      customer.orderHistory.push(newOrder._id);
      await customer.save();

      res.status(201).json(newOrder);
    } catch (error) {
      res.status(400).json({ message: "Server error", err: error.message });
    }
  }
);

// @route PATCH /api/v1/orders/:id
// @desc  Create an order
// @access Private
router.patch("/:id", protectUser, roleAuth(["user"]), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.orderDate || updates.customer) {
      return res
        .status(400)
        .json({ message: "Cannot update order date or customer" });
    }
    if (updates.address) {
      return res
        .status(400)
        .json({ message: "Cannot update address in a placed order" });
    }
    if (updates.items) {
      return res
        .status(400)
        .json({ message: "Cannot update items in a placed order" });
    }
    if (updates.totalAmount) {
      return res
        .status(400)
        .json({ message: "Cannot update total amount in a placed order" });
    }
    if (updates.status && !ALLOWED_ORDER_STATUSES.includes(updates.status)) {
      return res.status(400).json({ message: "Order status set is invalid" });
    }
    if (
      updates.paymentStatus &&
      !ALLOWED_PAYMENT_STATUSES.includes(updates.paymentStatus)
    ) {
      return res.status(400).json({ message: "Payment status set is invalid" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    Object.keys(updates).forEach((key) => {
      if (key != "comments") {
        order[key] = updates[key];
      } else {
        updates[key].forEach((com) => {
          order.comments.push(com);
        });
      }
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error", err: error.message });
  }
});

export default router;
