const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and authenticate user
 * Attaches user information to req.user if token is valid
 */
const verifyJWT = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Extract token (format: "Bearer TOKEN")
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Invalid token format.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Please login again.' 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed.' 
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Used for routes that work both for authenticated and non-authenticated users
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = { verifyJWT, optionalAuth };
