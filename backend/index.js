// ============================================
// Music Playlist Manager - Backend Server
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const pool = require('./config/database');

// Import all routes
const routes = require('./routes');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Music Playlist Manager API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      playlists: '/api/playlists',
      songs: '/api/songs',
      favorites: '/api/favorites',
      history: '/api/history',
      user: '/api/user'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      success: true,
      status: 'healthy',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Mount API routes
app.use('/api', routes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log('Server running on http://localhost:' + PORT);
      console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
      console.log('Database: ' + (process.env.DB_NAME || 'music_playlist_db'));
    });
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file configuration');
    console.error('3. Verify database credentials');
    console.error('4. Run: npm run init-db');
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

module.exports = app;
