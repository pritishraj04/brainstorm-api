import { Router } from "express";
import Customer from "../models/Customer.js";
import protect from "../middleware/authMiddleware.js";
import roleAuth from "../middleware/allowedRole.js";
import generateToken from "../utils/generateTokens.js";

const router = Router();

// @route GET /api/v1/customers/
// @desc  Get all the customers
// @access Private

router.get("/", protect, roleAuth(["user", "admin"]), async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route POST /api/v1/customers/
// @desc  Create a customer
// @access Public

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res
        .status(400)
        .json({ message: "Customer with this email already exist" });
    }

    const customer = new Customer({
      name,
      email,
      phone,
      password,
      token: crypto.randomUUID(),
    });

    const createdCustomer = await customer.save();
    res.status(201).json({
      name: createdCustomer.name,
      email: createdCustomer.email,
      phone: createdCustomer.phone,
      token: createdCustomer.token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route PATCH /api/v1/customers/:id
// @desc  Edit customer details except email address
// @access Private
// @param {string} id

router.patch(
  "/:id",
  protect,
  roleAuth(["user", "customer", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.email) {
        return res.status(400).json({ message: "Cannot update email address" });
      }
      if (updates.token) {
        return res.status(400).json({ message: "Cannot update token" });
      }

      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      Object.keys(updates).forEach((key) => {
        customer[key] = updates[key];
      });

      const updatedCustomer = await customer.save();

      res.json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

// @route POST /api/v1/customers/:customerId/addresses
// @desc  Create customer address
// @access Private
// @param {string} id

router.post(
  "/:id/addresses",
  protect,
  roleAuth(["user", "customer", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const address = req.body;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      customer.addresses.push(address);
      await customer.save();

      res.status(201).json(customer.addresses);
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

// @route PUT /api/v1/customers/:customerId/addresses/:addressId
// @desc  Update customer address
// @access Private
// @param {string} id

router.put(
  "/:id/addresses/:addressId",
  protect,
  roleAuth(["user", "customer", "admin"]),
  async (req, res) => {
    try {
      const { id, addressId } = req.params;
      const updatedAddress = req.body;

      const customer = Customer.findById(id);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      const address = customer.addresses.id(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      Object.assign(address, updatedAddress);
      await customer.save();
      res.status(200).json(customer.addresses);
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

// @route DELETE /api/v1/customers/:customerId/addresses/:addressId
// @desc  Delete customer address
// @access Private
// @param {string} id

router.delete(
  "/:id/addresses/:addressId",
  protect,
  roleAuth(["user", "customer", "admin"]),
  async (req, res) => {
    try {
      const { id, addressId } = req.params;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      customer.addresses.id(addressId).remove();

      await customer.save();

      res.status(200).json(customer.addresses);
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

// @route PUT /:customerId/addresses/:addressId/default
// @desc
// @access Private
// @param {string} id

router.put(
  "/customers/:id/addresses/:addressId/default",
  protect,
  roleAuth(["user", "customer", "admin"]),
  async (req, res) => {
    try {
      const { id, addressId } = req.params;
      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      customer.addresses.forEach((address) => {
        address.isDefault = address._id.toString() === addressId;
      });

      await customer.save();

      res.status(200).json(customer.addresses);
    } catch (error) {
      res.status(500).json({ message: "Server Error", err: error.message });
    }
  }
);

// @route   POST /api/v1/customers/login
// @desc    Authenticate a customer & get token
// @access  Public

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await Customer.findOne({ email });

    if (!customer || !(await customer.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { email },
      { $set: { token: generateToken(customer._id) } },
      { new: true }
    );
    res.json({
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      orderHistory: customer.orderHistory,
      addresses: customer.addresses,
      token: updatedCustomer.token,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", err: error.message });
  }
});

export default router;
