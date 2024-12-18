const User = require("../models/User");
const Interest = require("../models/Interest");
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendPasswordResetEmail } = require("../utils/email");
const crypto = require("crypto");

const setCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  domain:
    process.env.NODE_ENV === "production"
      ? ".onrender.com" // Allow subdomains on production
      : "localhost", // Use localhost for development
};

const googleCallback = (req, res) => {
  try {
    // Set JWT token in cookie
    console.log("10", process.env.NODE_ENV === "production");
    res.cookie("token", req.user.token, setCookieOptions);

    // Redirect to frontend
    // res.redirect(`${process.env.FRONTEND_URL}/onboarding`);
    res.json({ message: "Google callback successful" });
  } catch (error) {
    res.json({ message: "Google callback failed" });
  }
};

const register = async (req, res) => {
  try {
    const { username, full_name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
        field: existingUser.email === email ? "email" : "username",
      });
    }

    // Create new user
    const user = await User.create({
      username,
      full_name,
      email,
      password,
      isEmailVerified: false, // Set to false by default
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set HTTP-only cookie
    res.cookie("token", token, setCookieOptions);

    // Return success without sending the password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.otp;
    delete userWithoutPassword.otpExpires;

    return res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message:
        "Registration successful. Please verify your email with the OTP sent.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if this is a Google account
    if (user.isGoogleUser()) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google Sign-In. Please login with Google.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set HTTP-only cookie
    res.cookie("token", token, setCookieOptions);

    // Return user data without sensitive fields
    const userWithoutSensitive = user.toObject();
    delete userWithoutSensitive.password;
    delete userWithoutSensitive.resetPasswordToken;
    delete userWithoutSensitive.resetPasswordExpires;
    delete userWithoutSensitive.emailVerificationToken;
    delete userWithoutSensitive.emailVerificationExpires;

    return res.status(200).json({
      success: true,
      data: userWithoutSensitive,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during login",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying email",
    });
  }
};

// Add resend OTP functionality
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send new OTP email
    await sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Error resending OTP",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Don't reveal if user exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link will be sent.",
      });
    }

    // Check if user is a Google account
    if (user.isGoogleUser()) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Password reset is not available.",
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing forgot password request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Check if user is a Google account
    if (user.isGoogleUser()) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Password reset is not available.",
      });
    }

    // Update password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", setCookieOptions);
  res.json({ message: "Logged out successfully" });
};

const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
};

const onboarding = async (req, res) => {
  try {
    const { bio, interests } = req.body;
    const userId = req.user._id; // From auth middleware

    // Verify all interests exist
    const validInterests = await Interest.find({ _id: { $in: interests } });

    if (validInterests.length !== interests.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected interests are invalid",
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        bio,
        interests,
        isOnboarded: true, // Add this field to User model
      },
      { new: true }
    ).select("-password -emailVerificationToken -emailVerificationExpires");

    return res.status(200).json({
      success: true,
      data: user,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return res.status(500).json({
      success: false,
      message: "Error completing onboarding",
    });
  }
};

module.exports = {
  googleCallback,
  logout,
  getCurrentUser,
  register,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
  login,
  onboarding,
};
