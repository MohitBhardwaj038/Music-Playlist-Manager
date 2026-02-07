import React from "react";

const SongList = ({ playlist, onDeleteSong }) => {
  return (
    <div>
      <h3>Songs in {playlist?.name}</h3>
      {playlist.songs.length === 0 && <p>No songs found.</p>}
      {playlist.songs.map((song) => (
        <div key={song.id} style={{ marginBottom: "5px" }}>
          {song.title} - {song.artist}
          <button onClick={() => onDeleteSong(playlist.id, song.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default SongList;
