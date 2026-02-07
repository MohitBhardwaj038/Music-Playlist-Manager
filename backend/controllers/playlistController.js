const pool = require('../config/database');
const crypto = require('crypto');

/**
 * Get all playlists for the authenticated user
 */
const getPlaylists = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;

    const result = await client.query(
      `SELECT p.id, p.name, p.description, p.is_public, p.share_token, 
              p.created_at, p.updated_at,
              COUNT(ps.id) as song_count
       FROM playlists p
       LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.updated_at DESC`,
      [userId]
    );

    const playlists = result.rows.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      isPublic: playlist.is_public,
      shareToken: playlist.share_token,
      songCount: parseInt(playlist.song_count),
      createdAt: playlist.created_at,
      updatedAt: playlist.updated_at
    }));

    res.json({
      success: true,
      data: playlists
    });

  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching playlists' 
    });
  } finally {
    client.release();
  }
};

/**
 * Get a specific playlist by ID (with authorization check)
 */
const getPlaylistById = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get playlist with ownership check
    const playlistResult = await client.query(
      `SELECT p.*, u.name as owner_name
       FROM playlists p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Playlist not found' 
      });
    }

    const playlist = playlistResult.rows[0];

    // Check if user has access (owner or public playlist)
    if (playlist.user_id !== userId && !playlist.is_public) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. This playlist is private.' 
      });
    }

    // Get playlist songs
    const songsResult = await client.query(
      `SELECT id, track_id, track_name, artist_name, artwork_url, 
              preview_url, added_at
       FROM playlist_songs
       WHERE playlist_id = $1
       ORDER BY added_at DESC`,
      [id]
    );

    const songs = songsResult.rows.map(song => ({
      id: song.id,
      trackId: song.track_id,
      trackName: song.track_name,
      artistName: song.artist_name,
      artworkUrl100: song.artwork_url,
      previewUrl: song.preview_url,
      addedAt: song.added_at
    }));

    res.json({
      success: true,
      data: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        isPublic: playlist.is_public,
        shareToken: playlist.share_token,
        ownerName: playlist.owner_name,
        isOwner: playlist.user_id === userId,
        songs,
        createdAt: playlist.created_at,
        updatedAt: playlist.updated_at
      }
    });

  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching playlist' 
    });
  } finally {
    client.release();
  }
};

/**
 * Create a new playlist
 */
const createPlaylist = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Playlist name is required' 
      });
    }

    // Generate share token if public
    const shareToken = isPublic ? crypto.randomBytes(16).toString('hex') : null;

    const result = await client.query(
      `INSERT INTO playlists (user_id, name, description, is_public, share_token)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, is_public, share_token, created_at`,
      [userId, name.trim(), description || null, isPublic || false, shareToken]
    );

    const playlist = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      data: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        isPublic: playlist.is_public,
        shareToken: playlist.share_token,
        songCount: 0,
        createdAt: playlist.created_at
      }
    });

  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating playlist' 
    });
  } finally {
    client.release();
  }
};

/**
 * Update playlist (name, description, public status)
 */
const updatePlaylist = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const ownerCheck = await client.query(
      'SELECT user_id, share_token FROM playlists WHERE id = $1',
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Playlist not found' 
      });
    }

    if (ownerCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only edit your own playlists.' 
      });
    }

    // Generate or remove share token based on public status
    let shareToken = ownerCheck.rows[0].share_token;
    if (isPublic && !shareToken) {
      shareToken = crypto.randomBytes(16).toString('hex');
    } else if (!isPublic) {
      shareToken = null;
    }

    const result = await client.query(
      `UPDATE playlists 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_public = COALESCE($3, is_public),
           share_token = $4
       WHERE id = $5
       RETURNING id, name, description, is_public, share_token, updated_at`,
      [name, description, isPublic, shareToken, id]
    );

    const playlist = result.rows[0];

    res.json({
      success: true,
      message: 'Playlist updated successfully',
      data: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        isPublic: playlist.is_public,
        shareToken: playlist.share_token,
        updatedAt: playlist.updated_at
      }
    });

  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating playlist' 
    });
  } finally {
    client.release();
  }
};

/**
 * Delete a playlist
 */
const deletePlaylist = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const ownerCheck = await client.query(
      'SELECT user_id FROM playlists WHERE id = $1',
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Playlist not found' 
      });
    }

    if (ownerCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only delete your own playlists.' 
      });
    }

    await client.query('DELETE FROM playlists WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });

  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting playlist' 
    });
  } finally {
    client.release();
  }
};

/**
 * Add a song to a playlist
 */
const addSongToPlaylist = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { trackId, trackName, artistName, artworkUrl100, previewUrl } = req.body;
    const userId = req.user.id;

    // Validation
    if (!trackId || !trackName || !artistName) {
      return res.status(400).json({ 
        success: false,
        message: 'Song details are required (trackId, trackName, artistName)' 
      });
    }

    // Verify ownership
    const ownerCheck = await client.query(
      'SELECT user_id FROM playlists WHERE id = $1',
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Playlist not found' 
      });
    }

    if (ownerCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only add songs to your own playlists.' 
      });
    }

    // Check if song already exists in playlist
    const existingCheck = await client.query(
      'SELECT id FROM playlist_songs WHERE playlist_id = $1 AND track_id = $2',
      [id, trackId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Song already exists in this playlist' 
      });
    }

    // Add song to playlist
    const result = await client.query(
      `INSERT INTO playlist_songs 
       (playlist_id, track_id, track_name, artist_name, artwork_url, preview_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, track_id, track_name, artist_name, artwork_url, preview_url, added_at`,
      [id, trackId, trackName, artistName, artworkUrl100 || null, previewUrl || null]
    );

    const song = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Song added to playlist successfully',
      data: {
        id: song.id,
        trackId: song.track_id,
        trackName: song.track_name,
        artistName: song.artist_name,
        artworkUrl100: song.artwork_url,
        previewUrl: song.preview_url,
        addedAt: song.added_at
      }
    });

  } catch (error) {
    console.error('Add song error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding song to playlist' 
    });
  } finally {
    client.release();
  }
};

/**
 * Remove a song from a playlist
 */
const removeSongFromPlaylist = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id, songId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const ownerCheck = await client.query(
      'SELECT user_id FROM playlists WHERE id = $1',
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Playlist not found' 
      });
    }

    if (ownerCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only remove songs from your own playlists.' 
      });
    }

    // Remove song
    const result = await client.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND track_id = $2',
      [id, songId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Song not found in playlist' 
      });
    }

    res.json({
      success: true,
      message: 'Song removed from playlist successfully'
    });

  } catch (error) {
    console.error('Remove song error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing song from playlist' 
    });
  } finally {
    client.release();
  }
};

/**
 * Get public playlist by share token (no auth required)
 */
const getSharedPlaylist = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { token } = req.params;

    // Get playlist by share token
    const playlistResult = await client.query(
      `SELECT p.*, u.name as owner_name
       FROM playlists p
       JOIN users u ON p.user_id = u.id
       WHERE p.share_token = $1 AND p.is_public = TRUE`,
      [token]
    );

    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Shared playlist not found or is no longer public' 
      });
    }

    const playlist = playlistResult.rows[0];

    // Get playlist songs
    const songsResult = await client.query(
      `SELECT track_id, track_name, artist_name, artwork_url, 
              preview_url, added_at
       FROM playlist_songs
       WHERE playlist_id = $1
       ORDER BY added_at DESC`,
      [playlist.id]
    );

    const songs = songsResult.rows.map(song => ({
      trackId: song.track_id,
      trackName: song.track_name,
      artistName: song.artist_name,
      artworkUrl100: song.artwork_url,
      previewUrl: song.preview_url,
      addedAt: song.added_at
    }));

    res.json({
      success: true,
      data: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        ownerName: playlist.owner_name,
        songs,
        createdAt: playlist.created_at
      }
    });

  } catch (error) {
    console.error('Get shared playlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching shared playlist' 
    });
  } finally {
    client.release();
  }
};

/**
 * Search public playlists (no auth required)
 */
const searchPublicPlaylists = async (req, res) => {
  const client = await pool.connect();

  try {
    const { term } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    let result;
    if (term && term.trim()) {
      result = await client.query(
        `SELECT p.id, p.name, p.description, p.share_token, p.created_at,
                u.name as owner_name,
                COUNT(ps.id) as song_count
         FROM playlists p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
         WHERE p.is_public = TRUE
           AND (LOWER(p.name) LIKE $1 OR LOWER(p.description) LIKE $1 OR LOWER(u.name) LIKE $1)
         GROUP BY p.id, u.name
         ORDER BY COUNT(ps.id) DESC, p.created_at DESC
         LIMIT $2`,
        [`%${term.toLowerCase()}%`, limit]
      );
    } else {
      // No search term — return all public playlists
      result = await client.query(
        `SELECT p.id, p.name, p.description, p.share_token, p.created_at,
                u.name as owner_name,
                COUNT(ps.id) as song_count
         FROM playlists p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
         WHERE p.is_public = TRUE
         GROUP BY p.id, u.name
         ORDER BY COUNT(ps.id) DESC, p.created_at DESC
         LIMIT $1`,
        [limit]
      );
    }

    const playlists = result.rows.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      shareToken: p.share_token,
      ownerName: p.owner_name,
      songCount: parseInt(p.song_count),
      createdAt: p.created_at
    }));

    res.json({
      success: true,
      data: playlists
    });

  } catch (error) {
    console.error('Search public playlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching public playlists'
    });
  } finally {
    client.release();
  }
};

module.exports = { 
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getSharedPlaylist,
  searchPublicPlaylists
};
