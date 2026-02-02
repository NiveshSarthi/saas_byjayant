const express = require('express');
const authController = require('../controllers/auth');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const { authLimiter } = require('../middlewares/security');

const router = express.Router();

// Login route
router.post('/login', authLimiter, authController.login);

// Register route (Admin only)
router.post('/register', authLimiter, authenticate, authorize(['Admin']), authController.register);

// Logout route
router.post('/logout', authenticate, authController.logout);

module.exports = router;




