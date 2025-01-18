import express from "express";
import User, {
  userCreateValidation,
  userUpdateValidation,
} from "../models/Users.js";
import validate from "../middleware/validationMiddleware.js";
import generateToken from "../utils/generateTokens.js";
import protect from "../middleware/authMiddleware.js";
import roleAuth from "../middleware/allowedRole.js";

const router = express.Router();

// @route POST /api/v1/users/login
// @desc Auth user & get token
// @access Public

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { $set: { token: generateToken(user._id) } },
        { new: true }
      );
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: updatedUser.token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route POST /api/v1/users/register
// @desc Create user & get token
// @access Public

router.post("/register", validate(userCreateValidation), async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exist with this email" });
    }
    const user = await User.create({
      username,
      email,
      password,
      token: crypto.randomUUID(),
      role: role || "client",
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: user.token,
      role: user.role,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

// @route PATCH api/v1/users/:id
// @desc Update password role role
// @access Protected
// @param {string} id
router.patch(
  "/:id",
  protect,
  roleAuth(["admin"]),
  validate(userUpdateValidation),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.username) {
        res.status(400).json({ message: "Can not update username" });
      }
      if (updates.email) {
        res.status(400).json({ message: "Can not update email" });
      }
      if (updates.token) {
        res.status(400).json({ message: "Can not update token" });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      Object.keys(updates).forEach((key) => {
        user[key] = updates[key];
      });
      const updatedUser = await user.save();
      res.json({
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } catch (error) {}
  }
);

export default router;
