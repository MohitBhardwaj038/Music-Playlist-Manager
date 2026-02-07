const express = require('express');
const router = express.Router();
const { getSharedPlaylist } = require('../controllers/playlistController');

// Public route for shared playlists (no auth required)
router.get('/:token', getSharedPlaylist);

module.exports = router;
