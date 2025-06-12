const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthMiddleware {
  authenticate(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token.' });
    }
  }
  
  authorize(roles = []) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }
        
        // Get user role from database
        const [users] = await db.execute(
          'SELECT role FROM users WHERE id = ?',
          [req.user.userId]
        );
        
        if (users.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        const userRole = users[0].role;
        
        if (roles.length && !roles.includes(userRole)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        req.user.role = userRole;
        next();
      } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Authorization failed' });
      }
    };
  }
  
  optional(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but that's okay for optional auth
    }
    
    next();
  }
}

module.exports = new AuthMiddleware();
