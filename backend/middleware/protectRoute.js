import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Error in protectRoute middleware: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
