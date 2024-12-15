// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = {
  isAuthenticated: async (req, res, next) => {
    try {
      const token = req.cookies.jwt;

      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  isAdmin: (req, res, next) => {
    if (req.user && req.user.user_type === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Admin access required" });
    }
  },

  optionalAuth: async (req, res, next) => {
    try {
      const token = req.cookies.jwt;

      if (!token) {
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (user) {
        req.user = user;
      }

      next();
    } catch (error) {
      next();
    }
  },
};

module.exports = authMiddleware;
