const express = require('express');
const router = express.Router();
const { 
  getFavorites, 
  addFavorite, 
  removeFavorite, 
  checkFavorite 
} = require('../controllers/favoritesController');
const { verifyJWT } = require('../middleware/authMiddleware');

// All favorites routes are protected
router.get('/', verifyJWT, getFavorites);
router.post('/', verifyJWT, addFavorite);
router.delete('/:trackId', verifyJWT, removeFavorite);
router.get('/check/:trackId', verifyJWT, checkFavorite);

module.exports = router;
