const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware: token present:', !!token);
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'SYNDITECH_SECRET_2026');
    console.log('Decoded:', decoded);
    const user = await User.findById(decoded.id).populate('role');
    console.log('User found:', !!user, user?.role?.name);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticate: auth };