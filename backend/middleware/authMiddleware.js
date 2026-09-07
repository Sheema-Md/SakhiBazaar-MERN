const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token, attach to request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Middleware to check if user is a seller
const seller = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    if (req.user.status !== 'approved') {
      return res.status(403).json({ message: 'Access denied. Seller account vetting is pending or suspended.' });
    }
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Seller role required.' });
  }
};

// Middleware to check if user is an admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Middleware to check if user is either an approved seller or an admin
const sellerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, user not found' });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'seller') {
    if (req.user.status !== 'approved') {
      return res.status(403).json({ message: 'Access denied. Seller account vetting is pending or suspended.' });
    }
    return next();
  }

  return res.status(403).json({ message: 'Access denied. Seller or Admin role required.' });
};

module.exports = { protect, seller, admin, sellerOrAdmin };
