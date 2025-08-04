const express = require("express");
const { body } = require("express-validator");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  starProject,
  unstarProject,
  forkProject,
} = require("../controllers/projectController");
const { auth } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

const router = express.Router();

// Create project
router.post(
  "/",
  auth,
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 255 })
      .withMessage("Title must be less than 255 characters"),
    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters"),
    body("isPublic").optional().isBoolean().withMessage("isPublic must be boolean"),
    body("isCollaborative").optional().isBoolean().withMessage("isCollaborative must be boolean"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
  ],
  validate,
  createProject
);

// Get all projects
router.get("/", getProjects);

// Get project by ID
router.get("/:id", getProjectById);

// Update project
router.put("/:id", auth, updateProject);

// Delete project
router.delete("/:id", auth, deleteProject);

// Star project
router.post("/:id/star", auth, starProject);

// Unstar project
router.delete("/:id/star", auth, unstarProject);

// Fork project
router.post("/:id/fork", auth, forkProject);

// Add collaborator
router.post("/:id/collaborators", auth, require("../controllers/projectController").addCollaborator);
// Remove collaborator
router.delete("/:id/collaborators", auth, require("../controllers/projectController").removeCollaborator);

module.exports = router;