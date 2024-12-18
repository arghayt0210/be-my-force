const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = {
  // Check if user is authenticated
  isAuthenticated: async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
          code: "INVALID_TOKEN",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        code: "SERVER_ERROR",
      });
    }
  },

  // Check if user is admin
  isAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
        code: "ADMIN_REQUIRED",
      });
    }

    next();
  },

  // Check if email is verified
  isEmailVerified: (req, res, next) => {
    if (!req.user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
        code: "EMAIL_VERIFICATION_REQUIRED",
        isEmailVerified: false,
      });
    }
    next();
  },

  // Check if user has completed onboarding
  isOnboarded: (req, res, next) => {
    if (!req.user.isOnboarded) {
      return res.status(403).json({
        success: false,
        message: "Please complete onboarding first",
        code: "ONBOARDING_REQUIRED",
        isOnboarded: false,
      });
    }
    next();
  },

  // Combined check for email verification and onboarding
  isVerifiedAndOnboarded: (req, res, next) => {
    if (!req.user.isEmailVerified || !req.user.isOnboarded) {
      return res.status(403).json({
        success: false,
        message: !req.user.isEmailVerified
          ? "Please verify your email first"
          : "Please complete onboarding first",
        code: !req.user.isEmailVerified
          ? "EMAIL_VERIFICATION_REQUIRED"
          : "ONBOARDING_REQUIRED",
        isEmailVerified: req.user.isEmailVerified,
        isOnboarded: req.user.isOnboarded,
      });
    }
    next();
  },

  // Optional authentication for public routes that might need user data
  optionalAuth: async (req, res, next) => {
    try {
      const token = req.cookies.token;

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
      // Silently fail and continue without user data
      next();
    }
  },
};

module.exports = authMiddleware;
