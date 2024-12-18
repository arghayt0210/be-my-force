const mongoose = require("mongoose");
const Interest = require("../models/Interest");
require("dotenv").config();

const newInterests = [];

const updateInterests = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    // Get existing interests
    const existingInterests = await Interest.find({});
    console.log(`Found ${existingInterests.length} existing interests`);

    // Filter out interests that already exist (by slug)
    const existingSlugs = existingInterests.map((interest) => interest.slug);
    const interestsToAdd = newInterests.filter(
      (interest) => !existingSlugs.includes(interest.slug)
    );

    if (interestsToAdd.length === 0) {
      console.log("No new interests to add");
      process.exit(0);
    }

    console.log(`Adding ${interestsToAdd.length} new interests...`);

    // Insert only the new interests
    const result = await Interest.insertMany(interestsToAdd);

    console.log("New interests added successfully!");
    console.log("Added interests:", result.map((i) => i.name).join(", "));

    // Log total count of interests
    const finalCount = await Interest.countDocuments();
    console.log(`Total interests in database: ${finalCount}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error updating interests:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Add this to handle script termination
process.on("SIGINT", async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

updateInterests();
