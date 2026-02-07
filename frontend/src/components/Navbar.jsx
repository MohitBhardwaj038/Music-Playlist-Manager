import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { songService } from "../services/api";
import { FaSearch, FaHeart, FaHistory, FaCompass, FaUser } from "react-icons/fa";
import "../styles/Navbar.css";

const Navbar = ({ onSongSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchSongs(searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchSongs = async (term) => {
    setLoading(true);
    try {
      const response = await songService.search(term, 8);
      if (response.success) {
        setSearchResults(response.data.songs || []);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSongClick = (song) => {
    if (typeof onSongSelect === "function") {
      onSongSelect(song);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        🎵 MusicFlow
      </div>

      <div className="search-container" ref={searchRef}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search songs, artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && <span className="search-loading">●</span>}

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((song) => (
              <div
                key={song.trackId}
                className="search-item"
                onClick={() => handleSongClick(song)}
              >
                <img src={song.artworkUrl100} alt={song.trackName} />
                <div className="search-item-info">
                  <p>{song.trackName}</p>
                  <small>{song.artistName}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <button
          className={`nav-btn ${location.pathname === "/" ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          Home
        </button>
        <button
          className={`nav-btn ${location.pathname === "/search" ? "active" : ""}`}
          onClick={() => navigate("/search")}
        >
          <FaCompass /> Explore
        </button>
        <button
          className={`nav-btn ${location.pathname === "/favorites" ? "active" : ""}`}
          onClick={() => navigate("/favorites")}
        >
          <FaHeart /> Liked
        </button>
        <button
          className={`nav-btn ${location.pathname === "/history" ? "active" : ""}`}
          onClick={() => navigate("/history")}
        >
          <FaHistory /> History
        </button>
        <button
          className={`nav-btn ${location.pathname.startsWith("/playlists") ? "active" : ""}`}
          onClick={() => navigate("/playlists")}
        >
          Playlists
        </button>

        {user && (
          <div className="nav-user">
            <button
              className={`nav-btn nav-user-btn ${location.pathname === "/dashboard" ? "active" : ""}`}
              onClick={() => navigate("/dashboard")}
              title="Dashboard"
            >
              <FaUser /> <span className="nav-user-name">{user.name}</span>
            </button>
            <button className="nav-btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;





















