const mongoose = require("mongoose");
const Interest = require("../models/Interest");
require("dotenv").config();

const interests = [
  // Content Creation
  { name: "YouTube Content", slug: "youtube-content" },
  { name: "Instagram Reels", slug: "instagram-reels" },
  { name: "Video Editing", slug: "video-editing" },
  { name: "Photography", slug: "photography" },
  { name: "Vlogging", slug: "vlogging" },

  // Fitness & Wellness
  { name: "Gym Workout", slug: "gym-workout" },
  { name: "Yoga", slug: "yoga" },
  { name: "Calisthenics", slug: "calisthenics" },
  { name: "Nutrition", slug: "nutrition" },
  { name: "CrossFit", slug: "crossfit" },

  // Outdoor Sports
  { name: "Cricket", slug: "cricket" },
  { name: "Football", slug: "football" },
  { name: "Basketball", slug: "basketball" },
  { name: "Volleyball", slug: "volleyball" },
  { name: "Badminton", slug: "badminton" },
  { name: "Table Tennis", slug: "table-tennis" },
  { name: "Tennis", slug: "tennis" },

  // Turf Games
  { name: "Turf Football", slug: "turf-football" },
  { name: "Turf Cricket", slug: "turf-cricket" },
  { name: "Turf Basketball", slug: "turf-basketball" },
  { name: "Turf Volleyball", slug: "turf-volleyball" },
  { name: "Turf Badminton", slug: "turf-badminton" },
  { name: "Turf Table Tennis", slug: "turf-table-tennis" },
  { name: "Turf Tennis", slug: "turf-tennis" },

  // Study Partners
  { name: "Programming", slug: "programming" },
  { name: "Web Development", slug: "web-development" },
  { name: "Data Science", slug: "data-science" },
  { name: "Machine Learning", slug: "machine-learning" },
  { name: "Language Learning", slug: "language-learning" },
  { name: "UPSC Preparation", slug: "upsc-prep" },
  { name: "CAT Preparation", slug: "cat-prep" },
  { name: "GATE Preparation", slug: "gate-prep" },
  { name: "JEE Preparation", slug: "jee-prep" },

  // Party & Social
  { name: "Nightlife", slug: "nightlife" },
  { name: "Club Parties", slug: "club-parties" },
  { name: "House Parties", slug: "house-parties" },
  { name: "Beach Parties", slug: "beach-parties" },
  { name: "Karaoke Nights", slug: "karaoke" },
  { name: "Board Games", slug: "board-games" },
  { name: "Pool Parties", slug: "pool-parties" },
  { name: "Weekend Getaways", slug: "weekend-getaways" },

  // Travel
  { name: "Travel Vlogging", slug: "travel-vlogging" },
  { name: "Adventure Travel", slug: "adventure-travel" },
  { name: "Budget Travel", slug: "budget-travel" },
  { name: "Solo Travel", slug: "solo-travel" },
  { name: "Food Travel", slug: "food-travel" },

  // Social Media
  { name: "Social Media Growth", slug: "social-media-growth" },
  { name: "Content Strategy", slug: "content-strategy" },
  { name: "Personal Branding", slug: "personal-branding" },
  { name: "Digital Marketing", slug: "digital-marketing" },

  // Collaboration Types
  { name: "Duo Vlogging", slug: "duo-vlogging" },
  { name: "Group Travel", slug: "group-travel" },
  { name: "Gym Partners", slug: "gym-partners" },
  { name: "Creative Collaboration", slug: "creative-collaboration" },
  { name: "Study Groups", slug: "study-groups" },
  { name: "Sports Team", slug: "sports-team" },

  // Skills
  { name: "Public Speaking", slug: "public-speaking" },
  { name: "Camera Skills", slug: "camera-skills" },
  { name: "Script Writing", slug: "script-writing" },
  { name: "Storytelling", slug: "storytelling" },

  // Specific Content Niches
  { name: "Fitness Journey", slug: "fitness-journey" },
  { name: "Travel Tips", slug: "travel-tips" },
  { name: "Lifestyle Content", slug: "lifestyle-content" },
  { name: "Food Reviews", slug: "food-reviews" },
  { name: "Tech Reviews", slug: "tech-reviews" },
];

const seedInterests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing interests
    await Interest.deleteMany({});

    // Insert new interests
    await Interest.insertMany(interests);

    console.log("Interests seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding interests:", error);
    process.exit(1);
  }
};

seedInterests();
