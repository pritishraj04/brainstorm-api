import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import Customer from "../models/Customer.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      const customer = !user
        ? await Customer.findById(decoded.id).select("-password")
        : null;

      if (!user && !customer) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = user || customer;
      req.user.role = user ? user.role : "customer";

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token!" });
  }
};

export default protect;
