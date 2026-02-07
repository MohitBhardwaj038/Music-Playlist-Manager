const pool = require('../config/database');

/**
 * Get all favorite songs for the authenticated user
 */
const getFavorites = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;

    const result = await client.query(
      `SELECT id, track_id, track_name, artist_name, artwork_url, 
              preview_url, added_at
       FROM favorites
       WHERE user_id = $1
       ORDER BY added_at DESC`,
      [userId]
    );

    const favorites = result.rows.map(fav => ({
      id: fav.id,
      trackId: fav.track_id,
      trackName: fav.track_name,
      artistName: fav.artist_name,
      artworkUrl100: fav.artwork_url,
      previewUrl: fav.preview_url,
      addedAt: fav.added_at
    }));

    res.json({
      success: true,
      data: favorites
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching favorites' 
    });
  } finally {
    client.release();
  }
};

/**
 * Add a song to favorites
 */
const addFavorite = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const { trackId, trackName, artistName, artworkUrl100, previewUrl } = req.body;

    // Validation
    if (!trackId || !trackName || !artistName) {
      return res.status(400).json({ 
        success: false,
        message: 'Song details are required (trackId, trackName, artistName)' 
      });
    }

    // Check if already favorited
    const existingCheck = await client.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND track_id = $2',
      [userId, trackId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Song already in favorites' 
      });
    }

    // Add to favorites
    const result = await client.query(
      `INSERT INTO favorites 
       (user_id, track_id, track_name, artist_name, artwork_url, preview_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, track_id, track_name, artist_name, artwork_url, preview_url, added_at`,
      [userId, trackId, trackName, artistName, artworkUrl100 || null, previewUrl || null]
    );

    const favorite = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Song added to favorites',
      data: {
        id: favorite.id,
        trackId: favorite.track_id,
        trackName: favorite.track_name,
        artistName: favorite.artist_name,
        artworkUrl100: favorite.artwork_url,
        previewUrl: favorite.preview_url,
        addedAt: favorite.added_at
      }
    });

  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding to favorites' 
    });
  } finally {
    client.release();
  }
};

/**
 * Remove a song from favorites
 */
const removeFavorite = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const { trackId } = req.params;

    const result = await client.query(
      'DELETE FROM favorites WHERE user_id = $1 AND track_id = $2',
      [userId, trackId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Song not found in favorites' 
      });
    }

    res.json({
      success: true,
      message: 'Song removed from favorites'
    });

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing from favorites' 
    });
  } finally {
    client.release();
  }
};

/**
 * Check if a song is favorited
 */
const checkFavorite = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const { trackId } = req.params;

    const result = await client.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND track_id = $2',
      [userId, trackId]
    );

    res.json({
      success: true,
      data: {
        isFavorite: result.rows.length > 0
      }
    });

  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error checking favorite status' 
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
};
