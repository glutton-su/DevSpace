const express = require("express");
const { body } = require("express-validator");
const {
  createCodeSnippet,
  getCodeSnippets,
  getCodeSnippetById,
  updateCodeSnippet,
  deleteCodeSnippet,
  getLanguageStats,
  shareCodeSnippet,
  getPublicCodeSnippet,
  updateSnippetVisibility,
  getPublicSnippets,
  getUserOwnedSnippets,
  getUserStarredSnippets,
  getUserForkedSnippets,
  toggleSnippetStar,
  toggleSnippetLike,
  forkCodeSnippet,
  addSnippetCollaborator,
  removeSnippetCollaborator,
  getSnippetCollaborators,
} = require("../controllers/codeController");
const { auth } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

const router = express.Router();

// Create code snippet
router.post(
  "/",
  auth,
  [
    body("projectId").isInt().withMessage("Project ID must be an integer"),
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 255 })
      .withMessage("Title must be less than 255 characters"),
    body("content").notEmpty().withMessage("Content is required"),
    body("language").optional().isLength({ max: 50 }),
    body("filePath").optional().isLength({ max: 500 }),
  ],
  validate,
  createCodeSnippet
);

// Get code snippets for a project
router.get("/project/:projectId", getCodeSnippets);

// New snippet view routes (MUST come before /:id route)
router.get("/public/all", getPublicSnippets); // Public snippets for dashboard
router.get("/user/owned", auth, getUserOwnedSnippets); // User's own snippets
router.get("/user/starred", auth, getUserStarredSnippets); // User's starred snippets
router.get("/user/forked", auth, getUserForkedSnippets); // User's forked snippets

// Get public code snippets (legacy route)
router.get("/public", (req, res) => {
  require("../controllers/codeController").getAllPublicCodeSnippets(req, res);
});

// Get public code snippet by ID
router.get("/public/:id", getPublicCodeSnippet);

// Get code snippet by ID (MUST come after specific routes)
router.get("/:id", getCodeSnippetById);

// Update code snippet
router.put("/:id", auth, updateCodeSnippet);

// Delete code snippet
router.delete("/:id", auth, deleteCodeSnippet);

// Share code snippet (update visibility)
router.patch("/:id/share", auth, shareCodeSnippet);

// Update snippet visibility
router.patch("/:id/visibility", auth, updateSnippetVisibility);

// Star/Like/Fork functionality
router.post("/:id/star", auth, require("../controllers/codeController").toggleSnippetStar);
router.post("/:id/like", auth, require("../controllers/codeController").toggleSnippetLike);
router.post("/:id/fork", auth, require("../controllers/codeController").forkCodeSnippet);

// Get language statistics for a project
router.get("/project/:projectId/languages", getLanguageStats);

// Snippet collaboration routes
router.get("/:id/collaborators", auth, getSnippetCollaborators);
router.post("/:id/collaborators", auth, addSnippetCollaborator);
router.delete("/:id/collaborators", auth, removeSnippetCollaborator);

module.exports = router;