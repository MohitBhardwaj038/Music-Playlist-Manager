const pool = require('../config/database');

/**
 * Get listening history for the authenticated user
 */
const getHistory = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await client.query(
      `SELECT id, track_id, track_name, artist_name, artwork_url, 
              preview_url, played_at
       FROM listening_history
       WHERE user_id = $1
       ORDER BY played_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await client.query(
      'SELECT COUNT(*) FROM listening_history WHERE user_id = $1',
      [userId]
    );

    const history = result.rows.map(item => ({
      id: item.id,
      trackId: item.track_id,
      trackName: item.track_name,
      artistName: item.artist_name,
      artworkUrl100: item.artwork_url,
      previewUrl: item.preview_url,
      playedAt: item.played_at
    }));

    res.json({
      success: true,
      data: {
        history,
        total: parseInt(countResult.rows[0].count),
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching listening history' 
    });
  } finally {
    client.release();
  }
};

/**
 * Add a song to listening history
 */
const addToHistory = async (req, res) => {
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

    // Add to history (allow duplicates as they represent different play times)
    const result = await client.query(
      `INSERT INTO listening_history 
       (user_id, track_id, track_name, artist_name, artwork_url, preview_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, track_id, track_name, artist_name, artwork_url, preview_url, played_at`,
      [userId, trackId, trackName, artistName, artworkUrl100 || null, previewUrl || null]
    );

    const historyItem = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Song added to history',
      data: {
        id: historyItem.id,
        trackId: historyItem.track_id,
        trackName: historyItem.track_name,
        artistName: historyItem.artist_name,
        artworkUrl100: historyItem.artwork_url,
        previewUrl: historyItem.preview_url,
        playedAt: historyItem.played_at
      }
    });

  } catch (error) {
    console.error('Add to history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding to history' 
    });
  } finally {
    client.release();
  }
};

/**
 * Get recently played songs (unique tracks)
 */
const getRecentlyPlayed = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const result = await client.query(
      `SELECT DISTINCT ON (track_id) 
              id, track_id, track_name, artist_name, artwork_url, 
              preview_url, played_at
       FROM listening_history
       WHERE user_id = $1
       ORDER BY track_id, played_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    const recentSongs = result.rows.map(item => ({
      id: item.id,
      trackId: item.track_id,
      trackName: item.track_name,
      artistName: item.artist_name,
      artworkUrl100: item.artwork_url,
      previewUrl: item.preview_url,
      lastPlayed: item.played_at
    }));

    res.json({
      success: true,
      data: recentSongs
    });

  } catch (error) {
    console.error('Get recently played error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recently played songs' 
    });
  } finally {
    client.release();
  }
};

/**
 * Clear listening history
 */
const clearHistory = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;

    await client.query(
      'DELETE FROM listening_history WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Listening history cleared'
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error clearing history' 
    });
  } finally {
    client.release();
  }
};

/**
 * Get user dashboard stats
 */
const getDashboardStats = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;

    // Get various stats
    const stats = await client.query(
      `SELECT 
        (SELECT COUNT(*) FROM playlists WHERE user_id = $1) as total_playlists,
        (SELECT COUNT(*) FROM favorites WHERE user_id = $1) as total_favorites,
        (SELECT COUNT(*) FROM listening_history WHERE user_id = $1) as total_plays,
        (SELECT COUNT(DISTINCT track_id) FROM listening_history WHERE user_id = $1) as unique_songs_played`,
      [userId]
    );

    // Get most played songs
    const mostPlayed = await client.query(
      `SELECT track_id, track_name, artist_name, artwork_url, preview_url,
              COUNT(*) as play_count
       FROM listening_history
       WHERE user_id = $1
       GROUP BY track_id, track_name, artist_name, artwork_url, preview_url
       ORDER BY play_count DESC
       LIMIT 5`,
      [userId]
    );

    // Get recent activity
    const recentActivity = await client.query(
      `SELECT track_id, track_name, artist_name, artwork_url, preview_url, played_at
       FROM listening_history
       WHERE user_id = $1
       ORDER BY played_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalPlaylists: parseInt(stats.rows[0].total_playlists),
          totalFavorites: parseInt(stats.rows[0].total_favorites),
          totalPlays: parseInt(stats.rows[0].total_plays),
          uniqueSongsPlayed: parseInt(stats.rows[0].unique_songs_played)
        },
        mostPlayed: mostPlayed.rows.map(song => ({
          trackId: song.track_id,
          trackName: song.track_name,
          artistName: song.artist_name,
          artworkUrl100: song.artwork_url,
          previewUrl: song.preview_url,
          playCount: parseInt(song.play_count)
        })),
        recentActivity: recentActivity.rows.map(item => ({
          trackId: item.track_id,
          trackName: item.track_name,
          artistName: item.artist_name,
          artworkUrl100: item.artwork_url,
          previewUrl: item.preview_url,
          playedAt: item.played_at
        }))
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard stats' 
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getHistory,
  addToHistory,
  getRecentlyPlayed,
  clearHistory,
  getDashboardStats
};
