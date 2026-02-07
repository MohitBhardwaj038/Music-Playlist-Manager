const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const playlistRoutes = require('./playlistRoutes');
const songRoutes = require('./songRoutes');
const favoritesRoutes = require('./favoritesRoutes');
const historyRoutes = require('./historyRoutes');
const sharedRoutes = require('./sharedRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/playlists', playlistRoutes);
router.use('/songs', songRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/history', historyRoutes);
router.use('/shared', sharedRoutes);

// Legacy search route (keeping for backwards compatibility)
const { searchSongs } = require('../controllers/songController');
router.get('/search', searchSongs);

// Public playlist search (no auth required)
const { searchPublicPlaylists } = require('../controllers/playlistController');
router.get('/playlists/public/search', searchPublicPlaylists);

// User dashboard route
const { getDashboardStats } = require('../controllers/historyController');
const { getProfile } = require('../controllers/authController');
const { verifyJWT } = require('../middleware/authMiddleware');
router.get('/user/profile', verifyJWT, getProfile);
router.get('/user/dashboard', verifyJWT, getDashboardStats);

module.exports = router;
