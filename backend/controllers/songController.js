const axios = require('axios');

/**
 * Search songs using iTunes API
 */
const searchSongs = async (req, res) => {
  try {
    const { term, limit } = req.query;

    if (!term || term.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Search term is required' 
      });
    }

    const searchLimit = Math.min(parseInt(limit) || 25, 200);
    const encodedTerm = encodeURIComponent(term.trim());
    const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=song&limit=${searchLimit}`;

    const response = await axios.get(url);

    if (!response.data || !response.data.results) {
      return res.status(500).json({ 
        success: false,
        message: 'Invalid response from iTunes API' 
      });
    }

    // Filter only songs with preview URLs
    const songs = response.data.results
      .filter(song => song.previewUrl)
      .map(song => ({
        trackId: song.trackId,
        trackName: song.trackName,
        artistName: song.artistName,
        collectionName: song.collectionName,
        artworkUrl100: song.artworkUrl100,
        artworkUrl60: song.artworkUrl60,
        previewUrl: song.previewUrl,
        trackTimeMillis: song.trackTimeMillis,
        releaseDate: song.releaseDate,
        primaryGenreName: song.primaryGenreName
      }));

    res.json({
      success: true,
      data: {
        songs,
        count: songs.length
      }
    });

  } catch (error) {
    console.error('Search songs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching songs' 
    });
  }
};

/**
 * Get trending songs from iTunes
 */
const getTrendingSongs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    
    const response = await axios.get(`https://itunes.apple.com/us/rss/topsongs/limit=${limit}/json`);
    
    if (!response.data || !response.data.feed || !response.data.feed.entry) {
      return res.status(500).json({ 
        success: false,
        message: 'Invalid response from iTunes API' 
      });
    }

    const albumEntries = response.data.feed.entry;

    // Fetch detailed song information
    const songPromises = albumEntries.map(async (album) => {
      try {
        const collectionId = album.id.attributes["im:id"];
        const albumDetails = await axios.get(
          `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`
        );
        return albumDetails.data.results.filter((song) => song.previewUrl);
      } catch (error) {
        return [];
      }
    });

    const songDetails = await Promise.all(songPromises);
    const allSongs = songDetails.flat();

    const songs = allSongs.map(song => ({
      trackId: song.trackId,
      trackName: song.trackName,
      artistName: song.artistName,
      collectionName: song.collectionName,
      artworkUrl100: song.artworkUrl100,
      artworkUrl60: song.artworkUrl60,
      previewUrl: song.previewUrl,
      trackTimeMillis: song.trackTimeMillis,
      releaseDate: song.releaseDate,
      primaryGenreName: song.primaryGenreName
    }));

    res.json({
      success: true,
      data: {
        songs: songs.slice(0, limit),
        count: songs.slice(0, limit).length
      }
    });

  } catch (error) {
    console.error('Get trending songs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching trending songs' 
    });
  }
};

module.exports = { 
  searchSongs,
  getTrendingSongs
};
