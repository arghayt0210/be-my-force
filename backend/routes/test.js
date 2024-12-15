const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// others routes mention here not in server page

module.exports = router;
