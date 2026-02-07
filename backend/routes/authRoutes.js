const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const { verifyJWT } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', verifyJWT, getProfile);

module.exports = router;
