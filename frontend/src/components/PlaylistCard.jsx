import { Link } from "react-router-dom";
import "../styles/playlists.css";

const PlaylistCard = ({ playlist }) => {
  return (
    <Link to={`/playlists/${playlist.id}`} className="playlist-card">
      <h3>{playlist.name}</h3>
      <p>{playlist.description}</p>
    </Link>
  );
};

export default PlaylistCard;
