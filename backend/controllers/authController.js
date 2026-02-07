const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user
 */
const registerUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required (name, email, password)' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const userExists = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await client.query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, created_at`,
      [name, email.toLowerCase(), hashedPassword]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  } finally {
    client.release();
  }
};

/**
 * Login user
 */
const loginUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const result = await client.query(
      'SELECT id, name, email, password, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  } finally {
    client.release();
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;

    const result = await client.query(
      `SELECT u.id, u.name, u.email, u.created_at,
              COUNT(DISTINCT p.id) as playlist_count,
              COUNT(DISTINCT f.id) as favorites_count
       FROM users u
       LEFT JOIN playlists p ON u.id = p.user_id
       LEFT JOIN favorites f ON u.id = f.user_id
       WHERE u.id = $1
       GROUP BY u.id, u.name, u.email, u.created_at`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        stats: {
          playlistCount: parseInt(user.playlist_count),
          favoritesCount: parseInt(user.favorites_count)
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching profile' 
    });
  } finally {
    client.release();
  }
};

module.exports = { 
  registerUser, 
  loginUser,
  getProfile 
};
  