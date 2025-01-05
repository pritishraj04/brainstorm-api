const roleAuth = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error", err: error.message });
    }
  };
};

export default roleAuth;
