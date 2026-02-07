const express = require('express');
const router = express.Router();
const { 
  getHistory, 
  addToHistory, 
  getRecentlyPlayed, 
  clearHistory,
  getDashboardStats 
} = require('../controllers/historyController');
const { verifyJWT } = require('../middleware/authMiddleware');

// All history routes are protected
router.get('/', verifyJWT, getHistory);
router.post('/', verifyJWT, addToHistory);
router.get('/recent', verifyJWT, getRecentlyPlayed);
router.delete('/', verifyJWT, clearHistory);

// Dashboard stats
router.get('/dashboard', verifyJWT, getDashboardStats);

module.exports = router;
