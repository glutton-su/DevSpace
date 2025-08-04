const express = require("express");
const {
  avatarUpload,
  codeFileUpload,
  projectAssetsUpload,
} = require("../config/upload");
const {
  uploadAvatar,
  uploadCodeFiles,
  uploadProjectAssets,
  getFile,
  downloadFile,
  getProjectFiles,
  deleteFile,
} = require("../controllers/fileController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Upload avatar
router.post(
  "/avatar",
  auth,
  avatarUpload.single("avatar"),
  uploadAvatar
);

// Upload code files
router.post(
  "/code",
  auth,
  codeFileUpload.array("files", 10),
  uploadCodeFiles
);

// Upload project assets
router.post(
  "/assets",
  auth,
  projectAssetsUpload.array("files", 20),
  uploadProjectAssets
);

// Get file (view/display)
router.get("/:id", getFile);

// Download file
router.get("/:id/download", downloadFile);

// Get project files
router.get("/project/:projectId", getProjectFiles);

// Delete file
router.delete("/:id", auth, deleteFile);

module.exports = router;