import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { songService, favoritesService, playlistService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FaSearch, FaPlay, FaHeart, FaRegHeart, FaMusic, FaList, FaGlobe, FaUser } from 'react-icons/fa';
import { SkeletonCard } from '../components/Skeleton';
import '../styles/search.css';

const GENRES = [
  { label: 'Pop', term: 'pop music' },
  { label: 'Hip Hop', term: 'hip hop' },
  { label: 'Rock', term: 'rock music' },
  { label: 'R&B', term: 'r&b' },
  { label: 'Electronic', term: 'electronic music' },
  { label: 'Country', term: 'country music' },
  { label: 'Jazz', term: 'jazz' },
  { label: 'Classical', term: 'classical music' },
  { label: 'Latin', term: 'latin music' },
  { label: 'Indie', term: 'indie music' },
  { label: 'K-Pop', term: 'kpop' },
  { label: 'Bollywood', term: 'bollywood' },
];

const Search = ({ onSongSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGenre, setActiveGenre] = useState(null);
  const [activeTab, setActiveTab] = useState('songs');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const toast = useToast();
  const navigate = useNavigate();

  // Load public playlists on mount
  useEffect(() => {
    loadPublicPlaylists();
  }, []);

  const loadPublicPlaylists = async () => {
    try {
      const response = await playlistService.searchPublic('', 20);
      if (response.success) {
        setPublicPlaylists(response.data || []);
      }
    } catch (error) {
      console.error('Error loading public playlists:', error);
    }
  };

  const performSearch = async (term) => {
    if (!term.trim()) return;
    setLoading(true);
    try {
      const [songRes, playlistRes] = await Promise.all([
        songService.search(term, 30),
        playlistService.searchPublic(term, 20),
      ]);
      if (songRes.success) {
        setResults(songRes.data?.songs || []);
      }
      if (playlistRes.success) {
        setPublicPlaylists(playlistRes.data || []);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveGenre(null);
    performSearch(searchTerm);
  };

  const handleGenreClick = (genre) => {
    setActiveGenre(genre.label);
    setSearchTerm(genre.term);
    setActiveTab('songs');
    performSongSearch(genre.term);
  };

  const performSongSearch = async (term) => {
    if (!term.trim()) return;
    setLoading(true);
    try {
      const response = await songService.search(term, 30);
      if (response.success) {
        setResults(response.data?.songs || []);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    if (typeof onSongSelect === 'function') {
      onSongSelect(song);
    }
  };

  const handleToggleFavorite = async (e, song) => {
    e.stopPropagation();
    try {
      if (favoriteIds.has(song.trackId)) {
        await favoritesService.remove(song.trackId);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(song.trackId);
          return next;
        });
        toast.success('Removed from favorites');
      } else {
        await favoritesService.add({
          trackId: song.trackId,
          trackName: song.trackName,
          artistName: song.artistName,
          artworkUrl100: song.artworkUrl100,
          previewUrl: song.previewUrl,
        });
        setFavoriteIds(prev => new Set(prev).add(song.trackId));
        toast.success('Added to favorites');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error updating favorites';
      toast.error(msg);
    }
  };

  const handlePlaylistClick = (playlist) => {
    if (playlist.shareToken) {
      navigate(`/shared/${playlist.shareToken}`);
    }
  };

  const truncateText = (text, max) =>
    text && text.length > max ? text.substring(0, max) + '...' : text;

  return (
    <div className="search-page">
      <h1 className="search-page-title">Explore</h1>

      <form className="search-page-form" onSubmit={handleSearch}>
        <FaSearch className="search-page-icon" />
        <input
          type="text"
          placeholder="Search for songs, artists, or public playlists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {/* Tabs */}
      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === 'songs' ? 'active' : ''}`}
          onClick={() => setActiveTab('songs')}
        >
          <FaMusic /> Songs
        </button>
        <button
          className={`search-tab ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          <FaGlobe /> Public Playlists
          {publicPlaylists.length > 0 && (
            <span className="search-tab-count">{publicPlaylists.length}</span>
          )}
        </button>
      </div>

      {/* Songs Tab */}
      {activeTab === 'songs' && (
        <>
          {/* Genre Filters */}
          <div className="genre-filters">
            {GENRES.map((genre) => (
              <button
                key={genre.label}
                className={`genre-chip ${activeGenre === genre.label ? 'active' : ''}`}
                onClick={() => handleGenreClick(genre)}
              >
                {genre.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="search-results-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : results.length > 0 ? (
            <div className="search-results-grid">
              {results.map((song, index) => (
                <div
                  key={song.trackId || index}
                  className="search-result-card"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="search-card-img-wrap">
                    <img
                      src={song.artworkUrl100?.replace('100x100', '300x300')}
                      alt={song.trackName}
                      className="search-card-img"
                    />
                    <button
                      className="search-card-play"
                      onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                    >
                      <FaPlay />
                    </button>
                  </div>
                  <div className="search-card-info">
                    <p>{truncateText(song.trackName, 28)}</p>
                    <small>{truncateText(song.artistName, 28)}</small>
                  </div>
                  <button
                    className={`search-card-fav ${favoriteIds.has(song.trackId) ? 'active' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, song)}
                    title="Toggle favorite"
                  >
                    {favoriteIds.has(song.trackId) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
              ))}
            </div>
          ) : !loading && searchTerm ? (
            <div className="search-no-results">
              <span>🔍</span>
              <p>No songs found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="search-start">
              <span>🎵</span>
              <p>Search for music or pick a genre above</p>
            </div>
          )}
        </>
      )}

      {/* Playlists Tab */}
      {activeTab === 'playlists' && (
        <>
          {loading ? (
            <div className="search-results-grid">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : publicPlaylists.length > 0 ? (
            <div className="search-playlist-grid">
              {publicPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="search-playlist-card"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <div className="search-playlist-cover">
                    <FaList className="search-playlist-cover-icon" />
                  </div>
                  <div className="search-playlist-info">
                    <h3>{truncateText(playlist.name, 30)}</h3>
                    {playlist.description && (
                      <p className="search-playlist-desc">{truncateText(playlist.description, 50)}</p>
                    )}
                    <div className="search-playlist-meta">
                      <span><FaUser /> {playlist.ownerName}</span>
                      <span><FaMusic /> {playlist.songCount} song{playlist.songCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="search-no-results">
              <span>📂</span>
              <p>{searchTerm ? `No public playlists found for "${searchTerm}"` : 'No public playlists available yet'}</p>
              <small style={{ color: '#555', marginTop: 8, display: 'block' }}>
                Make your playlists public from Playlist Details to share them!
              </small>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
