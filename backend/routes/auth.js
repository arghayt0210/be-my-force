// routes/auth.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAuthenticated, isEmailVerified } = require("../middlewares/auth");
const {
  googleCallback,
  logout,
  getCurrentUser,
  register,
  resendOTP,
  verifyEmail,
  forgotPassword,
  resetPassword,
  login,
  onboarding,
} = require("../controllers/auth");
const validateRequest = require("../middlewares/validation");
const {
  registerSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  loginSchema,
  onboardingSchema,
} = require("../utils/validations");
const { z } = require("zod");
const { loginLimiter } = require("../middlewares/rateLimit");

// Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  googleCallback
);

// Register new user
// Register new user with validation
router.post("/register", validateRequest(registerSchema), register);

// Login route with rate limiting
router.post("/login", loginLimiter, validateRequest(loginSchema), login);

// Email verification routes
router.post(
  "/verify-email",
  isAuthenticated,
  validateRequest(verifyEmailSchema),
  verifyEmail
);
router.post(
  "/resend-otp",
  isAuthenticated,
  validateRequest(z.object({ email: z.string().email() })),
  resendOTP
);

// Password reset routes
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword
);

// Logout route
router.get("/logout", isAuthenticated, logout);

// // Get current user
router.get("/me", isAuthenticated, getCurrentUser);

router.post(
  "/onboarding",
  isAuthenticated,
  isEmailVerified,
  validateRequest(onboardingSchema),
  onboarding
);

module.exports = router;
