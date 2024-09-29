import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import Customer from "../models/Customer.js";

export const protectUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-passowrd");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token!" });
  }
};
export const protectCustomer = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user =
        (await Customer.findById(decoded.id).select("-passowrd")) ||
        (await User.findById(decoded.id).select("-password"));
      req.user.role = (await User.findById(decoded.id).select("-password"))
        ? "user"
        : "customer";
      console.log(req.user);
      console.log(req.params);

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Customer not found" });
      }
      if (req.user.role && req.user.role === "user") {
        next();
      } else if (req.user._id.toString() === req.params.id) {
        next();
      } else {
        return res.status(403).json({
          message: "Forbidden: You do not have access to this resource",
        });
      }
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token!" });
  }
};
