// routes/auth.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAuthenticated } = require("../middlewares/auth");

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
  (req, res) => {
    console.log("24-req.user", req.user);
    try {
      // Set JWT token in cookie
      res.cookie("jwt", req.user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Redirect to frontend
      res.redirect(`${process.env.FRONTEND_URL}/onboarding`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=true`);
    }
  }
);

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
});

// // Get current user
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
});

module.exports = router;
