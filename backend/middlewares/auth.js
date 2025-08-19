// /backend/middlewares/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Token extract (Authorization: Bearer <token> | cookies.token)
const extractToken = (req) => {
  const h = req.headers.authorization || req.header('Authorization') || '';
  if (h && h.startsWith('Bearer ')) return h.slice(7).trim();
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

// Core auth middleware
export const auth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Alias (compatibility)
export const requireAuth = auth;

// Role guard (use: requireRole('admin','manager'))
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

// Common helper for admin-only routes
export const isAdmin = (req, res, next) => requireRole('admin')(req, res, next);

// Default export (lets you do `import authPkg from './auth.js'`)
export default { auth, isAdmin, requireAuth: auth, requireRole };
