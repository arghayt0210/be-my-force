const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.MAILTRAP_SMTP_FROM,
    to: email,
    subject: "Email Verification OTP",
    html: `
      <h1>Email Verification</h1>
      <p>Your OTP for email verification is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Add to existing email.js
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

  const mailOptions = {
    from: process.env.MAILTRAP_SMTP_FROM,
    to: email,
    subject: "Password Reset Request",
    html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};
