import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { playlistService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaShare, FaGlobe, FaLock, FaCopy } from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";
import { SkeletonPlaylistHeader, SkeletonSongRow } from "../components/Skeleton";
import "../styles/playlistDetails.css";

const PlaylistDetails = ({ onSongSelect, fetchPlaylists }) => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sharingLoading, setSharingLoading] = useState(false);
  const dropdownRefs = useRef({});
  const toast = useToast();

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        const response = await playlistService.getById(id);
        if (response.success) {
          setPlaylist(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load playlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [id]);

  const handleDeleteSong = async (e, trackId) => {
    e.stopPropagation();
    setDeleteConfirm(trackId);
    setDropdownOpen(null);
  };

  const confirmDeleteSong = async () => {
    try {
      await playlistService.removeSong(id, deleteConfirm);
      setPlaylist((prev) => ({
        ...prev,
        songs: prev.songs.filter((song) => song.trackId !== deleteConfirm),
      }));
      toast.success("Song removed from playlist");
      if (fetchPlaylists) fetchPlaylists();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error removing song");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleTogglePublic = async () => {
    setSharingLoading(true);
    try {
      const newIsPublic = !playlist.isPublic;
      const response = await playlistService.update(id, { isPublic: newIsPublic });
      if (response.success) {
        setPlaylist((prev) => ({
          ...prev,
          isPublic: response.data.isPublic,
          shareToken: response.data.shareToken,
        }));
        toast.success(newIsPublic ? "Playlist is now public" : "Playlist is now private");
      }
    } catch (err) {
      toast.error("Failed to update sharing settings");
    } finally {
      setSharingLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    if (playlist?.shareToken) {
      const link = `${window.location.origin}/shared/${playlist.shareToken}`;
      navigator.clipboard.writeText(link);
      toast.success("Share link copied to clipboard!");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && dropdownRefs.current[dropdownOpen]) {
        if (!dropdownRefs.current[dropdownOpen].contains(event.target)) {
          setDropdownOpen(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  if (loading) return (
    <div className="pd-page">
      <SkeletonPlaylistHeader />
      {[1, 2, 3, 4, 5].map(i => <SkeletonSongRow key={i} />)}
    </div>
  );
  if (error) return <div className="pd-error">{error}</div>;

  const coverArt = playlist?.songs?.length > 0
    ? playlist.songs[0].artworkUrl100?.replace("100x100", "300x300")
    : null;

  return (
    <div className="pd-page">
      <div className="pd-header">
        {coverArt ? (
          <img className="pd-cover" src={coverArt} alt="Playlist Cover" />
        ) : (
          <div className="pd-cover-placeholder">🎵</div>
        )}
        <div className="pd-info">
          <h1>{playlist?.name}</h1>
          <p className="pd-meta">
            {playlist?.songs?.length || 0} song{playlist?.songs?.length !== 1 ? "s" : ""}
          </p>
          <div className="pd-sharing">
            <button
              className={`pd-share-toggle ${playlist?.isPublic ? 'public' : ''}`}
              onClick={handleTogglePublic}
              disabled={sharingLoading}
            >
              {playlist?.isPublic ? <><FaGlobe /> Public</> : <><FaLock /> Private</>}
            </button>
            {playlist?.isPublic && playlist?.shareToken && (
              <button className="pd-copy-link" onClick={handleCopyShareLink}>
                <FaCopy /> Copy Link
              </button>
            )}
          </div>
        </div>
      </div>

      {playlist?.songs?.length > 0 ? (
        <ul className="pd-song-list">
          {playlist.songs.map((song, index) => (
            <li
              key={song.trackId}
              className="pd-song-item"
              onClick={() => onSongSelect(song)}
            >
              <span className="pd-song-index">{index + 1}</span>
              <img
                src={song.artworkUrl100 || "/images/default-music.jpg"}
                alt={song.trackName}
                className="pd-song-img"
              />
              <div className="pd-song-info">
                <p className="pd-song-name">{song.trackName}</p>
                <small className="pd-song-artist">{song.artistName}</small>
              </div>

              <div
                className="pd-song-options"
                ref={(el) => (dropdownRefs.current[song.trackId] = el)}
              >
                <button
                  className="pd-options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === song.trackId ? null : song.trackId);
                  }}
                >
                  ⋮
                </button>
                {dropdownOpen === song.trackId && (
                  <div className="pd-dropdown">
                    <button onClick={(e) => handleDeleteSong(e, song.trackId)}>
                      🗑 Remove
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="pd-empty">
          <span className="pd-empty-icon">🎶</span>
          <p>No songs in this playlist yet. Search and add some!</p>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Remove Song"
        message="Remove this song from the playlist?"
        confirmText="Remove"
        onConfirm={confirmDeleteSong}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default PlaylistDetails;
