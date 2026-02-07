const express = require('express');
const router = express.Router();
const { 
  getPlaylists, 
  getPlaylistById, 
  createPlaylist, 
  updatePlaylist, 
  deletePlaylist, 
  addSongToPlaylist, 
  removeSongFromPlaylist,
  getSharedPlaylist 
} = require('../controllers/playlistController');
const { verifyJWT } = require('../middleware/authMiddleware');

// All playlist routes are protected
router.get('/', verifyJWT, getPlaylists);
router.post('/', verifyJWT, createPlaylist);
router.get('/:id', verifyJWT, getPlaylistById);
router.put('/:id', verifyJWT, updatePlaylist);
router.delete('/:id', verifyJWT, deletePlaylist);
router.post('/:id/songs', verifyJWT, addSongToPlaylist);
router.delete('/:id/songs/:songId', verifyJWT, removeSongFromPlaylist);

module.exports = router;
