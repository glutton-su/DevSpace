const { body, query, param, validationResult } = require('express-validator');

class ValidationMiddleware {
  handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
  
  validateRegister = [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be 3-50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('fullName')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Full name cannot exceed 100 characters'),
    this.handleValidationErrors
  ];
  
  validateLogin = [
    body('emailOrUsername')
      .notEmpty()
      .withMessage('Email or username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    this.handleValidationErrors
  ];
  
  validateEmail = [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    this.handleValidationErrors
  ];
  
  validateResetPassword = [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    this.handleValidationErrors
  ];
  
  validatePasswordChange = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    this.handleValidationErrors
  ];
  
  validateProfileUpdate = [
    body('fullName')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Full name cannot exceed 100 characters'),
    body('bio')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Bio cannot exceed 1000 characters'),
    body('githubUsername')
      .optional()
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/)
      .withMessage('Invalid GitHub username format'),
    body('websiteUrl')
      .optional()
      .isURL()
      .withMessage('Please provide a valid website URL'),
    body('location')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Location cannot exceed 100 characters'),
    body('themePreference')
      .optional()
      .isIn(['light', 'dark'])
      .withMessage('Theme preference must be either light or dark'),
    this.handleValidationErrors
  ];
  
  validateCodeCreation = [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content')
      .notEmpty()
      .withMessage('Code content is required')
      .isLength({ max: 1000000 })
      .withMessage('Code content too large'),
    body('language')
      .notEmpty()
      .withMessage('Programming language is required')
      .isLength({ max: 50 })
      .withMessage('Language name too long'),
    body('description')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Description cannot exceed 5000 characters'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Each tag cannot exceed 50 characters'),
    this.handleValidationErrors
  ];
  
  validateComment = [
    body('content')
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 2000 })
      .withMessage('Comment cannot exceed 2000 characters'),
    body('parentCommentId')
    ];
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

module.exports = { validate, ValidationMiddleware: new ValidationMiddleware() };
