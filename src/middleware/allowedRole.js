const roleAuth = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Assuming you have authenticated the user and customer separately
      const user = req.user || req.customer; // Either user or customer will be set in the auth middleware

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const role = user.role || (req.customer ? "customer" : "user");

      // Check if role is allowed
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      res.status(500).json({ message: "Server error", err: error.message });
    }
  };
};

export default roleAuth;
