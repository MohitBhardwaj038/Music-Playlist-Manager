-- Drop tables if they exist (for development/reset)
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS listening_history CASCADE;
DROP TABLE IF EXISTS playlist_songs CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlists table
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist songs table (stores songs added to playlists)
CREATE TABLE playlist_songs (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    track_id VARCHAR(255) NOT NULL,
    track_name VARCHAR(500) NOT NULL,
    artist_name VARCHAR(500) NOT NULL,
    artwork_url VARCHAR(1000),
    preview_url VARCHAR(1000),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, track_id)
);

-- Listening history table
CREATE TABLE listening_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id VARCHAR(255) NOT NULL,
    track_name VARCHAR(500) NOT NULL,
    artist_name VARCHAR(500) NOT NULL,
    artwork_url VARCHAR(1000),
    preview_url VARCHAR(1000),
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table (liked songs)
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id VARCHAR(255) NOT NULL,
    track_name VARCHAR(500) NOT NULL,
    artist_name VARCHAR(500) NOT NULL,
    artwork_url VARCHAR(1000),
    preview_url VARCHAR(1000),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, track_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_playlists_share_token ON playlists(share_token);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
