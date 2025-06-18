const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;

// Create upload directories if they don't exist
const createUploadDirs = async () => {
  const dirs = [
    "uploads",
    "uploads/avatars",
    "uploads/code-files",
    "uploads/project-assets",
    "uploads/temp",
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};

// Initialize upload directories
createUploadDirs();

// Storage configuration for different file types
const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
};

// File filter for images (avatars)
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// File filter for code files
const codeFileFilter = (req, file, cb) => {
  const allowedTypes = /txt|js|ts|jsx|tsx|py|java|cpp|c|h|css|html|xml|json|md|sql|php|rb|go|rs|swift|kt|dart|vue|scss|sass|less|yml|yaml|toml|ini|cfg|conf|log/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error("File type not allowed for code uploads"));
  }
};

// File filter for project assets
const assetFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|txt|md|json|xml|csv/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype) || 
    file.mimetype.startsWith('text/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/json';

  if ((mimetype && extname) || (extname && file.mimetype.startsWith('text/'))) {
    return cb(null, true);
  } else {
    cb(new Error("File type not allowed"));
  }
};

// Avatar upload configuration
const avatarUpload = multer({
  storage: createStorage("uploads/avatars"),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

// Code file upload configuration
const codeFileUpload = multer({
  storage: createStorage("uploads/code-files"),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10, // Maximum 10 files at once
  },
  fileFilter: codeFileFilter,
});

// Project assets upload configuration
const projectAssetsUpload = multer({
  storage: createStorage("uploads/project-assets"),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 20, // Maximum 20 files at once
  },
  fileFilter: assetFilter,
});

// Temporary upload for processing
const tempUpload = multer({
  storage: createStorage("uploads/temp"),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = {
  avatarUpload,
  codeFileUpload,
  projectAssetsUpload,
  tempUpload,
  createUploadDirs,
};