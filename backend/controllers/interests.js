const Interest = require("../models/Interest");

exports.getAllInterests = async (req, res) => {
  try {
    const interests = await Interest.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: interests,
    });
  } catch (error) {
    console.error("Error fetching interests:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching interests",
    });
  }
};
