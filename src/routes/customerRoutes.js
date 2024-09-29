import { Router } from "express";
import Customer from "../models/Customer.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

// @route GET /api/v1/customers/
// @desc  Get all the customers
// @access Private
router.get("/", protect, async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route POST /api/v1/customers/
// @desc  Create a customer
// @access Private
router.post("/", protect, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res
        .status(400)
        .json({ message: "Customer with this email already exist" });
    }

    const customer = new Customer({ name, email, phone });

    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route PATCH /api/v1/customers/:id
// @desc  Edit customer details except email address
// @access Private
router.patch("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.email) {
      return res.status(400).json({ message: "Cannot update email address" });
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
});

// @route POST /api/v1/customers/:customerId/addresses
// @desc  Create customer address
// @access Private

router.post("/:customerId/addresses", protect, async (req, res) => {
  try {
    const { customerId } = req.params;
    const address = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    customer.addresses.push(address);
    await customer.save();

    res.status(201).json(customer.addresses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route PUT /api/v1/customers/:customerId/addresses/:addressId
// @desc  Update customer address
// @access Private

router.put("/:customerId/addresses/:addressId", protect, async (req, res) => {
  try {
    const { customerId, addressId } = req.params;
    const updatedAddress = req.body;

    const customer = Customer.findById(customerId);

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
});

// @route DELETE /api/v1/customers/:customerId/addresses/:addressId
// @desc  Delete customer address
// @access Private

router.delete(
  "/:customerId/addresses/:addressId",
  protect,
  async (req, res) => {
    try {
      const { customerId, addressId } = req.params;

      const customer = await Customer.findById(customerId);
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

router.put(
  "/customers/:customerId/addresses/:addressId/default",
  protect,
  async (req, res) => {
    try {
      const { customerId, addressId } = req.params;

      const customer = await Customer.findById(customerId);
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

export default router;
