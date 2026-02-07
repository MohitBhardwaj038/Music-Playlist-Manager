import React, { useState, useEffect, useRef } from "react";
import { playlistService, favoritesService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/MusicPlayer.css";

const MusicPlayer = ({ currentSong, playlists, onUpdatePlaylists }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const audioRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.previewUrl;
      audioRef.current.volume = volume;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  // Check if current song is favorited
  useEffect(() => {
    const checkFav = async () => {
      if (currentSong?.trackId) {
        try {
          const res = await favoritesService.check(currentSong.trackId);
          setIsFavorite(res.data?.isFavorite || false);
        } catch {
          setIsFavorite(false);
        }
      }
    };
    checkFav();
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (!currentSong || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const newTime = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlaylistId("");
    setNewPlaylistName("");
  };

  const handleAddToExisting = async () => {
    if (!selectedPlaylistId || !currentSong) return;

    setLoading(true);
    try {
      const response = await playlistService.addSong(selectedPlaylistId, {
        trackId: currentSong.trackId,
        trackName: currentSong.trackName,
        artistName: currentSong.artistName,
        artworkUrl100: currentSong.artworkUrl100,
        previewUrl: currentSong.previewUrl,
      });

      if (response.success) {
        const pl = playlists.find((p) => String(p.id) === String(selectedPlaylistId));
        toast.success(`Added to "${pl?.name || "playlist"}"`);
        onUpdatePlaylists();
        handleCloseModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding song");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim() || !currentSong) return;

    setLoading(true);
    try {
      const createRes = await playlistService.create(newPlaylistName, "", false);

      if (createRes.success) {
        await playlistService.addSong(createRes.data.id, {
          trackId: currentSong.trackId,
          trackName: currentSong.trackName,
          artistName: currentSong.artistName,
          artworkUrl100: currentSong.artworkUrl100,
          previewUrl: currentSong.previewUrl,
        });

        toast.success(`Created "${newPlaylistName}" with song added`);
        onUpdatePlaylists();
        handleCloseModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentSong) return;
    try {
      if (isFavorite) {
        await favoritesService.remove(currentSong.trackId);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await favoritesService.add({
          trackId: currentSong.trackId,
          trackName: currentSong.trackName,
          artistName: currentSong.artistName,
          artworkUrl100: currentSong.artworkUrl100,
          previewUrl: currentSong.previewUrl,
        });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating favorites");
    }
  };

  return (
    <div className="music-player">
      {currentSong && (
        <input
          type="range"
          className="player-seek"
          value={progress}
          onChange={handleSeek}
          style={{ "--progress": `${progress}%` }}
        />
      )}

      {/* Left: Song Info */}
      <div className="player-song">
        {currentSong ? (
          <>
            <img
              src={currentSong.artworkUrl100}
              alt={currentSong.trackName}
              className="player-artwork"
            />
            <div className="player-song-info">
              <p className="player-song-name">{currentSong.trackName}</p>
              <small className="player-artist-name">{currentSong.artistName}</small>
            </div>
            <button
              className={`player-fav-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </button>
          </>
        ) : (
          <div className="player-no-song">
            <span>🎶</span> Select a song to play
          </div>
        )}
      </div>

      {/* Center: Controls */}
      <div className="player-controls">
        <button className="player-ctrl-btn" disabled={!currentSong}>⏮</button>
        <button
          className="player-ctrl-btn player-play-btn"
          onClick={togglePlayPause}
          disabled={!currentSong}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="player-ctrl-btn" disabled={!currentSong}>⏭</button>
      </div>

      {/* Right: Volume + Add */}
      <div className="player-actions">
        {currentSong && (
          <>
            <div className="player-volume-group">
              <span className="player-volume-icon">🔊</span>
              <input
                type="range"
                className="player-volume"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
            <button className="player-add-btn" onClick={() => setShowModal(true)}>
              + Add to Playlist
            </button>
          </>
        )}
      </div>

      <audio ref={audioRef} />

      {/* Modal */}
      {showModal && (
        <div className="player-modal-overlay" onClick={handleCloseModal}>
          <div className="player-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add to Playlist</h2>

            <h3>Choose existing playlist</h3>
            <select
              value={selectedPlaylistId}
              onChange={(e) => setSelectedPlaylistId(e.target.value)}
            >
              <option value="">-- Select Playlist --</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <div className="player-modal-actions">
              <button
                className="modal-btn-primary"
                onClick={handleAddToExisting}
                disabled={!selectedPlaylistId || loading}
              >
                {loading ? "Adding..." : "Add to Playlist"}
              </button>
            </div>

            <div className="modal-divider">or</div>

            <h3>Create a new playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter playlist name"
            />

            <div className="player-modal-actions">
              <button
                className="modal-btn-primary"
                onClick={handleCreateAndAdd}
                disabled={!newPlaylistName.trim() || loading}
              >
                {loading ? "Creating..." : "Create & Add"}
              </button>
              <button className="modal-btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
