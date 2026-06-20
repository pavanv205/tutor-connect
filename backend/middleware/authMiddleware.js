const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Protect routes - Verify JWT Token
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tutorconnect_secret_key_123'
    );

    // Get user from DB (or fallback file database if MongoDB is down)
    let user;
    if (mongoose.connection.readyState !== 1) {
      const dbFallback = require('../utils/dbFallback');
      const users = await dbFallback.getUsers();
      user = users.find(u => String(u._id) === String(decoded.id));
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this id'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Invalid or expired token.'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route.`
      });
    }
    next();
  };
};
