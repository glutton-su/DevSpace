const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be 3-50 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    body("fullName")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Full name must be less than 100 characters"),
  ],
  validate,
  register
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// Refresh token
router.post(
  "/refresh",
  [
    body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  ],
  validate,
  refreshToken
);

// Logout
router.post("/logout", logout);

// Get current user profile
router.get("/profile", auth, getProfile);

// Update profile
router.put(
  "/profile",
  auth,
  [
    body("fullName")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Full name must be less than 100 characters"),
    body("bio")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Bio must be less than 500 characters"),
    body("themePreference")
      .optional()
      .isIn(["light", "dark"])
      .withMessage("Theme preference must be 'light' or 'dark'"),
  ],
  validate,
  updateProfile
);

// Change password
router.put(
  "/change-password",
  auth,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  ],
  validate,
  changePassword
);

// Forgot password
router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
  ],
  validate,
  forgotPassword
);

// Reset password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  ],
  validate,
  resetPassword
);

module.exports = router;