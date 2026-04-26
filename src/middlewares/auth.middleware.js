const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const { query } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const result = await query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'User no longer exists.', 401);
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please log in again.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `Access denied. Requires role: ${roles.join(' or ')}.`, 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
