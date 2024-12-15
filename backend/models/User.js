const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password is required only for local authentication
      },
    },
    profile_image: {
      type: String,
    },
    profile_image_asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
    user_type: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],

    // Google OAuth fields
    googleId: String,

    // Email verification fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // OTP fields
    otp: String,
    otpExpires: Date,

    // Timestamps
    lastLogin: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function (otp) {
  return this.otp === otp && Date.now() <= this.otpExpires;
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // Token expires in 30 minutes
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
