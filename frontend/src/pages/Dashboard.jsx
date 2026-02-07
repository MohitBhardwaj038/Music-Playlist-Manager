import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyService, authService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { FaMusic, FaHeart, FaListUl, FaPlay, FaClock, FaUser } from 'react-icons/fa';
import { SkeletonDashboard } from '../components/Skeleton';
import '../styles/dashboard.css';

const Dashboard = ({ onSongSelect }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await historyService.getDashboard();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
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
      <div className="dashboard-page">
        <SkeletonDashboard />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-greeting">
        <div className="dashboard-avatar">
          <FaUser />
        </div>
        <div>
          <h1>Welcome back, {user?.name || 'User'}</h1>
          <p className="dashboard-subtitle">Here's your music overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card" onClick={() => navigate('/playlists')}>
          <div className="stat-icon stat-playlists">
            <FaListUl />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.stats?.totalPlaylists || 0}</span>
            <span className="stat-label">Playlists</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/favorites')}>
          <div className="stat-icon stat-favorites">
            <FaHeart />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.stats?.totalFavorites || 0}</span>
            <span className="stat-label">Liked Songs</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/history')}>
          <div className="stat-icon stat-history">
            <FaClock />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.stats?.totalPlays || 0}</span>
            <span className="stat-label">Songs Played</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-songs">
            <FaMusic />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.stats?.uniqueSongsPlayed || 0}</span>
            <span className="stat-label">Unique Tracks</span>
          </div>
        </div>
      </div>

      {/* Most Played */}
      {stats?.mostPlayed?.length > 0 && (
        <section className="dashboard-section">
          <h2>Most Played</h2>
          <div className="top-artists-grid">
            {stats.mostPlayed.slice(0, 6).map((song, index) => (
              <div key={index} className="top-artist-card" onClick={() => handlePlaySong(song)}>
                <div className="top-artist-rank">{index + 1}</div>
                <span className="top-artist-name">{song.trackName}</span>
                <span className="top-artist-plays">{song.playCount} plays</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {stats?.recentActivity?.length > 0 && (
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Recent Activity</h2>
            <button className="dashboard-see-all" onClick={() => navigate('/history')}>
              See All
            </button>
          </div>
          <ul className="dashboard-recent">
            {stats.recentActivity.slice(0, 8).map((song, index) => (
              <li
                key={`${song.trackId}-${index}`}
                className="dashboard-recent-item"
                onClick={() => handlePlaySong(song)}
              >
                <img
                  src={song.artworkUrl100}
                  alt={song.trackName}
                  className="dashboard-recent-img"
                />
                <div className="dashboard-recent-info">
                  <p>{song.trackName}</p>
                  <small>{song.artistName}</small>
                </div>
                <button
                  className="dashboard-play-btn"
                  onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                >
                  <FaPlay />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!stats?.recentActivity?.length && !stats?.mostPlayed?.length && (
        <div className="dashboard-empty">
          <span>🎵</span>
          <h3>Start listening!</h3>
          <p>Your stats and activity will show up here once you play some songs</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
