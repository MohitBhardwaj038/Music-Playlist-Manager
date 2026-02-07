import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { playlistService } from "../services/api";
import "../styles/playlists.css";

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await playlistService.getAll();
        if (response.success) {
          setPlaylists(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (loading) {
    return (
      <div className="playlists-page">
        <div className="playlists-loading">
          <div className="playlists-loading-spinner" />
          <p>Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="playlists-page">
      <div className="playlists-header">
        <h1>Your Playlists</h1>
        <p className="playlists-subtitle">
          {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && <p className="playlists-error">{error}</p>}

      {playlists.length > 0 ? (
        <div className="playlist-grid">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="playlist-card"
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            >
              <div className="playlist-card-icon">🎵</div>
              <h3>{playlist.name}</h3>
              <p className="playlist-card-meta">
                {playlist.songCount || 0} songs
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="playlists-empty">
          <span className="playlists-empty-icon">📂</span>
          <h3>No playlists yet</h3>
          <p>Create your first playlist from the sidebar</p>
        </div>
      )}
    </div>
  );
}

export default Playlists;
