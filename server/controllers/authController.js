const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const emailService = require('../services/emailService');

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password, fullName } = req.body;
      
      // Check if user already exists
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ 
          error: 'User with this email or username already exists' 
        });
      }
      
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, fullName]
      );
      
      const userId = result.insertId;
      
      // Generate JWT token
      const token = jwt.sign(
        { userId, username, email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: userId,
          username,
          email,
          fullName
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
  
  async login(req, res) {
    try {
      const { emailOrUsername, password } = req.body;
      
      // Find user by email or username
      const [users] = await db.execute(
        'SELECT id, username, email, password_hash, full_name, role, theme_preference FROM users WHERE email = ? OR username = ?',
        [emailOrUsername, emailOrUsername]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = users[0];
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last active
      await db.execute('UPDATE users SET last_active = NOW() WHERE id = ?', [user.id]);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          themePreference: user.theme_preference
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
  
  async getProfile(req, res) {
    try {
      const [users] = await db.execute(
        `SELECT u.id, u.username, u.email, u.full_name, u.bio, u.avatar_url, 
                u.github_username, u.website_url, u.location, u.theme_preference, 
                u.role, u.created_at, us.total_codes, us.total_stars_received, 
                us.total_followers, us.total_projects
         FROM users u 
         LEFT JOIN user_stats us ON u.id = us.id 
         WHERE u.id = ?`,
        [req.user.userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user: users[0] });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
  
  async updateProfile(req, res) {
    try {
      const { fullName, bio, githubUsername, websiteUrl, location, themePreference } = req.body;
      
      await db.execute(
        'UPDATE users SET full_name = ?, bio = ?, github_username = ?, website_url = ?, location = ?, theme_preference = ? WHERE id = ?',
        [fullName, bio, githubUsername, websiteUrl, location, themePreference, req.user.userId]
      );
      
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
  
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Get current password hash
      const [users] = await db.execute(
        'SELECT password_hash FROM users WHERE id = ?',
        [req.user.userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password
      await db.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, req.user.userId]
      );
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
  
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
      
      // Always return success to prevent email enumeration
      if (users.length === 0) {
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store reset token (you might want to create a separate table for this)
      await db.execute(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
        [hashedToken, expiresAt, email]
      );
      
      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken);
      
      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  }
  
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      const [users] = await db.execute(
        'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [hashedToken]
      );
      
      if (users.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password and clear reset token
      await db.execute(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [passwordHash, users[0].id]
      );
      
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
  
  async logout(req, res) {
    // Since we're using stateless JWT, we just send a success response
    // In a production app, you might want to maintain a blacklist of tokens
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = new AuthController();