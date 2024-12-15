// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { uploadSingleFile } = require("../utils/cloudinary");

// We don't need serializeUser and deserializeUser since we're not using sessions
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        // Upload profile image to Cloudinary
        const profileImageUrl = profile.photos[0].value;

        // Create temporary user if it doesn't exist (for asset creation)
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            full_name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.emails[0].value.split("@")[0],
            isEmailVerified: true,
            lastLogin: new Date(),
          });
        }

        // Upload profile image and create asset
        const uploadResult = await uploadSingleFile({
          file: profileImageUrl,
          relatedModel: "User",
          subfolder: "profile",
          userId: user._id,
          relatedId: user._id,
        });

        if (uploadResult) {
          user.profile_image = uploadResult.cloudinary.secure_url;
          user.profile_image_asset = uploadResult.asset._id; // Store the Asset ID
          user.lastLogin = new Date();
          await user.save();
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });

        // Pass both user and token to the callback
        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
