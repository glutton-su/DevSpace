const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');


// Public routes
router.post('/register', validationMiddleware.validateRegister, authController.register);
router.post('/login', validationMiddleware.validateLogin, authController.login);
router.post('/forgot-password', validationMiddleware.validateEmail, authController.forgotPassword);
router.post('/reset-password', validationMiddleware.validateResetPassword, authController.resetPassword);

// Protected routes  
router.post('/logout', authMiddleware.authenticate, authController.logout);
router.get('/me', authMiddleware.authenticate, authController.getProfile);
router.put('/me', authMiddleware.authenticate, validationMiddleware.validateProfileUpdate, authController.updateProfile);
router.post('/change-password', authMiddleware.authenticate, validationMiddleware.validatePasswordChange, authController.changePassword);

module.exports = router;