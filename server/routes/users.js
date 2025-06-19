const express = require("express");
const {
  getUserProfile,
  getUserProjects,
  searchUsers,
  updateUserStats,
  followUser,
} = require("../controllers/userController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Search users
router.get("/search", searchUsers);

// Update current user's stats
router.post("/stats/update", auth, updateUserStats);

// Get user profile
router.get("/:username", getUserProfile);

// Get user projects
router.get("/:username/projects", getUserProjects);

// Follow user
router.post("/:username/follow", auth, followUser);

module.exports = router;