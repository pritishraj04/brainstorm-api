import express from "express";
import User from "../models/Users.js";
import generateToken from "../utils/generateTokens.js";

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

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
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
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: user.token,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server Error", err: error.message });
  }
});

export default router;
