const { User } = require("../models");
const { verify: verifyToken } = require("../utils/jwt");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
      console.log('🔑 Auth middleware - Full token received:', token);
      console.log('🔑 Auth middleware - Token length:', token.length);
      console.log('🔑 Auth middleware - Token first 50 chars:', token.substring(0, 50));
      
      const decoded = verifyToken(token);
      console.log('🔑 Auth middleware - Token decoded successfully:', decoded.userId);

      // Check if it's an access token
      if (decoded.type && decoded.type !== "access") {
        return res.status(401).json({ message: "Invalid token type" });
      }

      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ["passwordHash"] },
      });

      if (!user) {
        return res.status(401).json({ message: "Token is not valid" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ 
          message: "Token expired",
          code: "TOKEN_EXPIRED"
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyToken(token);

      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ["passwordHash"] },
      });

      if (user) {
        req.user = user;
      }
    } catch (error) {
      // If token is invalid, continue without user
      console.log("Optional auth - invalid token:", error.message);
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next();
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Insufficient permissions" });
    }

    next();
  };
};

const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      message: "Email verification required",
      code: "EMAIL_NOT_VERIFIED"
    });
  }

  next();
};

module.exports = {
  auth,
  optionalAuth,
  requireRole,
  requireVerification,
};