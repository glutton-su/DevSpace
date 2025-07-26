const express = require("express");
const {
  getUserProfile,
  getUserProjects,
  searchUsers,
  updateUserStats,
  followUser,
  getUserSnippetStats,
  deleteUser,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
} = require("../controllers/userController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Search users
router.get("/search", searchUsers);

// Update current user's stats
router.post("/stats/update", auth, updateUserStats);

// Update current user's profile
router.put("/profile", auth, updateUserProfile);

// Update current user's email
router.put("/email", auth, updateUserEmail);

// Update current user's password
router.put("/password", auth, updateUserPassword);

// Get user profile
router.get("/:username", getUserProfile);

// Get user projects
router.get("/:username/projects", getUserProjects);

// Get user snippet statistics
router.get("/:username/snippet-stats", getUserSnippetStats);

// Follow user
router.post("/:username/follow", auth, followUser);

// Delete current user account
router.delete("/account", auth, deleteUser);

module.exports = router;