const bcrypt = require("bcryptjs");
const { User, UserStats } = require("../models");
const {
  genAccess: generateAccessToken,
  genRefresh: generateRefreshToken,
  verify: verifyToken,
} = require("../utils/jwt");

// Store refresh tokens (in production, use Redis or database)
const refreshTokens = new Set();

const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    // Create user (password will be hashed by the model hook)
    const user = await User.create({
      username,
      email,
      passwordHash: password, // This will be hashed by the beforeCreate hook
      fullName,
    });

    // Create user stats
    await UserStats.create({ userId: user.id });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    refreshTokens.add(refreshToken);

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: UserStats,
          as: "stats",
        },
      ],
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check password using the model method
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    refreshTokens.add(refreshToken);

    // Update last login (optional)
    await user.update({ lastLogin: new Date() });

    res.json({
      success: true,           // ✅ Add success property
      message: "Login successful",
      token: accessToken,      // ✅ Change accessToken to token
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        name: user.fullName,   // ✅ Add name field for frontend
        role: user.role,
        themePreference: user.themePreference,
        avatar: user.avatarUrl, // ✅ Map avatarUrl to avatar
        avatarUrl: user.avatarUrl,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    if (!refreshTokens.has(token)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    try {
      const decoded = verifyToken(token);

      if (decoded.type !== "refresh") {
        return res.status(403).json({ message: "Invalid token type" });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(decoded.userId);

      res.json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      // Remove invalid refresh token
      refreshTokens.delete(token);
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      refreshTokens.delete(token);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: UserStats,
          as: "stats",
        },
      ],
      attributes: { exclude: ["passwordHash"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, themePreference } = req.body;

    await User.update(
      {
        fullName,
        bio,
        themePreference,
      },
      {
        where: { id: req.user.id },
      }
    );

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["passwordHash"] },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.validatePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password (will be hashed by the model hook)
    await user.update({ passwordHash: newPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        message: "If email exists, password reset instructions have been sent",
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = require("jsonwebtoken").sign(
      { userId: user.id, type: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // In production, send email with reset link
    // For now, just return the token (remove this in production)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      message: "If email exists, password reset instructions have been sent",
      // Remove this in production:
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    try {
      const decoded = verifyToken(token);

      if (decoded.type !== "password_reset") {
        return res.status(400).json({ message: "Invalid reset token" });
      }

      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(400).json({ message: "Invalid reset token" });
      }

      // Update password
      await user.update({ passwordHash: newPassword });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};