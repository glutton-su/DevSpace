const express = require("express");
const { body } = require("express-validator");
const {
  createCodeSnippet,
  getCodeSnippets,
  getCodeSnippetById,
  updateCodeSnippet,
  deleteCodeSnippet,
  getLanguageStats,
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

// Get code snippet by ID
router.get("/:id", getCodeSnippetById);

// Update code snippet
router.put("/:id", auth, updateCodeSnippet);

// Delete code snippet
router.delete("/:id", auth, deleteCodeSnippet);

// Get language statistics for a project
router.get("/project/:projectId/languages", getLanguageStats);

module.exports = router;