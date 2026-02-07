import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { playlistService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaEllipsisV, FaTrash } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";
import "../styles/sidebar.css";

const Sidebar = ({ playlists, fetchPlaylists }) => {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    setLoading(true);
    try {
      const response = await playlistService.create(newPlaylistName, "", false);
      if (response.success) {
        setNewPlaylistName("");
        fetchPlaylists();
        toast.success(`Playlist "${newPlaylistName}" created`);
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error(error.response?.data?.message || "Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (e, playlistId) => {
    e.stopPropagation();
    setDeleteConfirm(playlistId);
    setDropdownOpen(null);
  };

  const confirmDelete = async () => {
    try {
      const response = await playlistService.delete(deleteConfirm);
      if (response.success) {
        fetchPlaylists();
        toast.success("Playlist deleted");
      }
    } catch (error) {
      toast.error("Error deleting playlist");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 onClick={() => navigate("/playlists")}>📚 Library</h2>
      </div>

      <div className="sidebar-create">
        <input
          type="text"
          placeholder="New playlist..."
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
        />
        <button
          className="sidebar-create-btn"
          onClick={handleCreatePlaylist}
          disabled={loading || !newPlaylistName.trim()}
          title="Create playlist"
        >
          +
        </button>
      </div>

      <ul className="sidebar-playlist-list">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <li
              key={playlist.id}
              className="sidebar-playlist-item"
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            >
              <div className="sidebar-playlist-info">
                <div className="sidebar-playlist-icon">🎵</div>
                <div>
                  <div className="sidebar-playlist-name">{playlist.name}</div>
                  <div className="sidebar-playlist-count">
                    {playlist.songCount || 0} songs
                  </div>
                </div>
              </div>

              <div className="sidebar-playlist-menu" ref={dropdownOpen === playlist.id ? dropdownRef : null}>
                <button
                  className="sidebar-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === playlist.id ? null : playlist.id);
                  }}
                >
                  <FaEllipsisV />
                </button>

                {dropdownOpen === playlist.id && (
                  <div className="sidebar-dropdown">
                    <button onClick={(e) => handleDeletePlaylist(e, playlist.id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))
        ) : (
          <div className="sidebar-empty">
            <span>🎶</span>
            Create your first playlist
          </div>
        )}
      </ul>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default Sidebar;
