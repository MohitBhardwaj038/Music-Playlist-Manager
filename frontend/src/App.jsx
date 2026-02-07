import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import { playlistService, historyService } from "./services/api";
import Navbar from "./components/Navbar";
import MusicPlayer from "./components/MusicPlayer";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import PlaylistDetails from "./pages/PlaylistDetails";
import Login from "./pages/Login";
import Favorites from "./pages/Favorites";
import RecentlyPlayed from "./pages/RecentlyPlayed";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import SharedPlaylist from "./pages/SharedPlaylist";
import "./App.css";

function AppContent() {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchPlaylists();
    }
  }, []);

  useEffect(() => {
    if (currentSong && currentSong.trackId) {
      trackSongPlay(currentSong);
    }
  }, [currentSong]);

  const fetchPlaylists = async () => {
    try {
      const response = await playlistService.getAll();
      if (response.success) {
        setPlaylists(response.data);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const trackSongPlay = async (song) => {
    try {
      await historyService.add({
        trackId: song.trackId,
        trackName: song.trackName,
        artistName: song.artistName,
        artworkUrl100: song.artworkUrl100,
        previewUrl: song.previewUrl
      });
    } catch (error) {
      console.error("Error tracking song play:", error);
    }
  };

  const handleSongSelect = (song) => {
    if (song?.previewUrl) {
      setCurrentSong(song);
    }
  };

  const isLoginPage = location.pathname === "/login";
  const isSharedPage = location.pathname.startsWith("/shared/");
  const showSidebar = !isLoginPage && !isSharedPage && !location.pathname.startsWith("/playlists");

  return (
    <>
      {!isLoginPage && <Navbar onSongSelect={handleSongSelect} />}

      <div className="app-layout">
        {showSidebar && (
          <Sidebar playlists={playlists} fetchPlaylists={fetchPlaylists} />
        )}

        <div
          className="main-content"
          style={{
            marginLeft: isLoginPage || isSharedPage ? "0" : showSidebar ? "260px" : "0",
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/shared/:token" element={<SharedPlaylist onSongSelect={handleSongSelect} />} />
            
            <Route path="/" element={<ProtectedRoute><Home onSongSelect={handleSongSelect} /></ProtectedRoute>} />
            <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
            <Route path="/playlists/:id" element={<ProtectedRoute><PlaylistDetails onSongSelect={handleSongSelect} fetchPlaylists={fetchPlaylists} /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites onSongSelect={handleSongSelect} /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><RecentlyPlayed onSongSelect={handleSongSelect} /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard onSongSelect={handleSongSelect} /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search onSongSelect={handleSongSelect} /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {!isLoginPage && (
        <MusicPlayer
          currentSong={currentSong}
          playlists={playlists}
          onUpdatePlaylists={fetchPlaylists}
        />
      )}

      <Toast />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
