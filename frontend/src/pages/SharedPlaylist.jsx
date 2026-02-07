import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { playlistService } from '../services/api';
import { FaPlay, FaUser } from 'react-icons/fa';
import '../styles/sharedPlaylist.css';

const SharedPlaylist = ({ onSongSelect }) => {
  const { token } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSharedPlaylist();
  }, [token]);

  const fetchSharedPlaylist = async () => {
    try {
      setLoading(true);
      const response = await playlistService.getShared(token);
      if (response.success) {
        setPlaylist(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Playlist not found or is no longer public');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    if (typeof onSongSelect === 'function') {
      onSongSelect(song);
    }
  };

  if (loading) {
    return (
      <div className="shared-page">
        <div className="shared-loading">
          <div className="shared-spinner" />
          <p>Loading shared playlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-page">
        <div className="shared-error">
          <span>🔗</span>
          <h3>Link Unavailable</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const coverArt = playlist?.songs?.[0]?.artworkUrl100?.replace('100x100', '300x300');

  return (
    <div className="shared-page">
      <div className="shared-badge">🌐 Shared Playlist</div>

      <div className="shared-header">
        {coverArt ? (
          <img className="shared-cover" src={coverArt} alt="Cover" />
        ) : (
          <div className="shared-cover-placeholder">🎵</div>
        )}
        <div className="shared-info">
          <h1>{playlist?.name}</h1>
          {playlist?.description && (
            <p className="shared-desc">{playlist.description}</p>
          )}
          <div className="shared-meta">
            <span className="shared-owner">
              <FaUser /> {playlist?.ownerName}
            </span>
            <span>•</span>
            <span>{playlist?.songs?.length || 0} songs</span>
          </div>
        </div>
      </div>

      {playlist?.songs?.length > 0 ? (
        <ul className="shared-song-list">
          {playlist.songs.map((song, index) => (
            <li
              key={song.trackId}
              className="shared-song-item"
              onClick={() => handlePlaySong(song)}
            >
              <span className="shared-song-index">{index + 1}</span>
              <img
                src={song.artworkUrl100}
                alt={song.trackName}
                className="shared-song-img"
              />
              <div className="shared-song-info">
                <p>{song.trackName}</p>
                <small>{song.artistName}</small>
              </div>
              <button
                className="shared-play-btn"
                onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
              >
                <FaPlay />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="shared-empty">
          <p>This playlist has no songs</p>
        </div>
      )}
    </div>
  );
};

export default SharedPlaylist;
