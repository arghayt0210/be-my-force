const mongoose = require("mongoose");

const initializeDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/be-my-force"
    );
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

module.exports = initializeDatabase;
