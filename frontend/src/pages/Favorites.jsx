import React, { useState, useEffect } from 'react';
import { favoritesService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FaHeart, FaPlay } from 'react-icons/fa';
import { SkeletonSongRow } from '../components/Skeleton';
import '../styles/favorites.css';

const Favorites = ({ onSongSelect }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesService.getAll();
      if (response.success) {
        setFavorites(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (trackId) => {
    try {
      await favoritesService.remove(trackId);
      setFavorites(prev => prev.filter(f => f.trackId !== trackId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  const handlePlaySong = (song) => {
    if (typeof onSongSelect === 'function') {
      onSongSelect(song);
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <div className="favorites-header-icon">
          <FaHeart />
        </div>
        <div>
          <h1>Liked Songs</h1>
          <p className="favorites-subtitle">
            {favorites.length} song{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="favorites-skeleton">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonSongRow key={i} />)}
        </div>
      ) : favorites.length > 0 ? (
        <ul className="favorites-list">
          {favorites.map((song, index) => (
            <li
              key={song.trackId}
              className="favorites-item"
              onClick={() => handlePlaySong(song)}
            >
              <span className="favorites-index">{index + 1}</span>
              <img
                src={song.artworkUrl100}
                alt={song.trackName}
                className="favorites-img"
              />
              <div className="favorites-info">
                <p className="favorites-name">{song.trackName}</p>
                <small className="favorites-artist">{song.artistName}</small>
              </div>

              <div className="favorites-actions">
                <button
                  className="favorites-play-btn"
                  onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                  title="Play"
                >
                  <FaPlay />
                </button>
                <button
                  className="favorites-heart-btn active"
                  onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(song.trackId); }}
                  title="Remove from favorites"
                >
                  <FaHeart />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="favorites-empty">
          <span className="favorites-empty-icon">💜</span>
          <h3>No liked songs yet</h3>
          <p>Click the heart icon on any song to add it here</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
