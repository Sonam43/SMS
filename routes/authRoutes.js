const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

// Login
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Email verification
router.get('/verify-email', authController.verifyEmail);

// Forgot Password
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

// Reset Password
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
