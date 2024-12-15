// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/test");
const initializeSocket = require("./config/socket");
const http = require("http");
const initializeDatabase = require("./config/database");

const app = express();
const server = http.createServer(app); // Create HTTP server
initializeDatabase();
const io = initializeSocket(server); // Initialize socket.io

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Initialize passport
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", testRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
