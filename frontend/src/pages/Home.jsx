import React, { useState, useEffect } from "react";
import axios from "axios";
import { favoritesService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaHeart, FaRegHeart, FaPlay } from "react-icons/fa";
import { SkeletonCard } from "../components/Skeleton";
import styles from "../styles/Home.module.css";

const Home = ({ onSongSelect }) => {
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const toast = useToast();

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://itunes.apple.com/us/rss/topsongs/limit=20/json"
        );
        const entries = response.data.feed.entry;

        const songDetails = await Promise.all(
          entries.slice(0, 12).map(async (entry) => {
            try {
              const id = entry.id.attributes["im:id"];
              const details = await axios.get(
                `https://itunes.apple.com/lookup?id=${id}&entity=song`
              );
              return details.data.results.filter((s) => s.previewUrl);
            } catch {
              return [];
            }
          })
        );

        setTrendingSongs(songDetails.flat());
      } catch (error) {
        console.error("Error fetching trending songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingSongs();

    // Fetch user's favorites for heart icons
    const fetchFavorites = async () => {
      try {
        const res = await favoritesService.getAll();
        if (res.success && res.data) {
          setFavoriteIds(new Set(res.data.map(f => f.trackId)));
        }
      } catch { /* ignore */ }
    };
    fetchFavorites();
  }, []);

  const truncateText = (text, maxLength) =>
    text && text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  const handleToggleFavorite = async (e, song) => {
    e.stopPropagation();
    try {
      if (favoriteIds.has(song.trackId)) {
        await favoritesService.remove(song.trackId);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(song.trackId);
          return next;
        });
        toast.success("Removed from favorites");
      } else {
        await favoritesService.add({
          trackId: song.trackId,
          trackName: song.trackName,
          artistName: song.artistName,
          artworkUrl100: song.artworkUrl100,
          previewUrl: song.previewUrl,
        });
        setFavoriteIds(prev => new Set(prev).add(song.trackId));
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating favorites");
    }
  };

  return (
    <div className={styles.home}>
      <section className={styles["home-section"]}>
        <h2 className={styles["home-section-title"]}>
          <span>🔥</span> Trending Now
        </h2>

        {loading ? (
          <div className={styles.songList}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className={styles.songList}>
            {trendingSongs.length > 0 ? (
              trendingSongs.slice(0, 18).map((song, index) => (
                <div
                  key={song.trackId || index}
                  className={styles.songCard}
                  onClick={() => onSongSelect(song)}
                >
                  <div className={styles.songImgWrap}>
                    <img
                      src={song.artworkUrl100?.replace("100x100", "300x300")}
                      alt={song.trackName}
                      className={styles.songImg}
                    />
                    <button
                      className={`${styles.songPlayBtn}`}
                      onClick={(e) => { e.stopPropagation(); onSongSelect(song); }}
                    >
                      <FaPlay />
                    </button>
                    <button
                      className={`${styles.songFavBtn} ${favoriteIds.has(song.trackId) ? styles.active : ''}`}
                      onClick={(e) => handleToggleFavorite(e, song)}
                    >
                      {favoriteIds.has(song.trackId) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>
                  <div className={styles.songInfo}>
                    <p>{truncateText(song.trackName, 28)}</p>
                    <small>{truncateText(song.artistName, 28)}</small>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#666", padding: "20px" }}>
                No trending songs available right now.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
