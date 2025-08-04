const multer = require("multer");

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          message: "File too large",
          maxSize: "File size limit exceeded",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          message: "Too many files",
          maxCount: "Maximum file count exceeded",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          message: "Unexpected field name for file upload",
        });
      default:
        return res.status(400).json({
          message: "File upload error",
          error: error.message,
        });
    }
  }

  if (error) {
    return res.status(400).json({
      message: error.message || "File upload error",
    });
  }

  next();
};

// File validation middleware
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  // Additional custom validations can be added here
  next();
};

module.exports = {
  handleMulterError,
  validateFileUpload,
};