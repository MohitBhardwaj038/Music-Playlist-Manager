import React, { useState, useEffect } from 'react';
import { historyService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FaHistory, FaPlay, FaTrash } from 'react-icons/fa';
import { SkeletonSongRow } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/recentlyPlayed.css';

const RecentlyPlayed = ({ onSongSelect }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await historyService.getAll(50, 0);
      if (response.success) {
        setHistory(response.data?.history || response.data || []);
      }
    } catch (error) {
      toast.error('Failed to load listening history');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await historyService.clear();
      setHistory([]);
      setShowClearConfirm(false);
      toast.success('History cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const handlePlaySong = (song) => {
    if (typeof onSongSelect === 'function') {
      onSongSelect(song);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="history-header-icon">
          <FaHistory />
        </div>
        <div className="history-header-text">
          <h1>Recently Played</h1>
          <p className="history-subtitle">
            {history.length} song{history.length !== 1 ? 's' : ''} in history
          </p>
        </div>
        {history.length > 0 && (
          <button
            className="history-clear-btn"
            onClick={() => setShowClearConfirm(true)}
          >
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="history-skeleton">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonSongRow key={i} />)}
        </div>
      ) : history.length > 0 ? (
        <ul className="history-list">
          {history.map((song, index) => (
            <li
              key={`${song.trackId}-${index}`}
              className="history-item"
              onClick={() => handlePlaySong(song)}
            >
              <img
                src={song.artworkUrl100}
                alt={song.trackName}
                className="history-img"
              />
              <div className="history-info">
                <p className="history-name">{song.trackName}</p>
                <small className="history-artist">{song.artistName}</small>
              </div>
              <span className="history-time">{formatTime(song.playedAt)}</span>
              <button
                className="history-play-btn"
                onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                title="Play again"
              >
                <FaPlay />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="history-empty">
          <span className="history-empty-icon">🎧</span>
          <h3>No listening history</h3>
          <p>Songs you play will appear here</p>
        </div>
      )}

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear History"
        message="This will remove all your listening history. This action cannot be undone."
        confirmText="Clear All"
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default RecentlyPlayed;
