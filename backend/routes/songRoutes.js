const express = require('express');
const router = express.Router();
const { searchSongs, getTrendingSongs } = require('../controllers/songController');

// Public routes (no auth required for discovery)
router.get('/search', searchSongs);
router.get('/trending', getTrendingSongs);

module.exports = router;
