const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const {
  User,
  Project,
  Star,
  ProjectCollaborator,
  UserStats,
  CodeSnippet,
  Like,
  Comment,
} = require("../models");

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
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
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10, type = "all" } = req.query;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const offset = (page - 1) * limit;
    let whereClause = { userId: user.id };

    // If viewing another user's profile, only show public projects
    if (!req.user || req.user.id !== user.id) {
      whereClause.isPublic = true;
    }

    // Filter by type (own, forked, starred)
    if (type === "forked") {
      whereClause.forkedFrom = { [Op.ne]: null };
    } else if (type === "original") {
      whereClause.forkedFrom = null;
    }

    let projects;
    let count;

    if (type === "starred") {
      // Get starred projects
      const starredProjects = await Star.findAndCountAll({
        where: { userId: user.id },
        include: [
          {
            model: Project,
            as: "project",
            where: req.user && req.user.id === user.id ? {} : { isPublic: true },
            include: [
              {
                model: User,
                as: "owner",
                attributes: ["id", "username", "avatarUrl"],
              },
            ],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["starredAt", "DESC"]],
      });

      projects = starredProjects.rows.map((star) => star.project);
      count = starredProjects.count;
    } else {
      const result = await Project.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "username", "avatarUrl"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      projects = result.rows;
      count = result.count;
    }

    res.json({
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get user projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query too short" });
    }

    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${q}%` } },
          { fullName: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ["id", "username", "fullName", "avatarUrl", "bio"],
      include: [
        {
          model: UserStats,
          as: "stats",
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["username", "ASC"]],
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Calculate total projects
    const totalProjects = await Project.count({
      where: { userId },
    });

    // Calculate total stars received
    const totalStarsReceived = await Star.count({
      include: [
        {
          model: Project,
          as: "project",
          where: { userId },
          attributes: [],
        },
      ],
    });

    // Calculate total forks received
    const totalForksReceived = await Project.count({
      where: { forkedFrom: { [Op.in]: 
        require("sequelize").literal(`(SELECT id FROM projects WHERE user_id = ${userId})`)
      }},
    });

    // Calculate most used language
    const languageStats = await CodeSnippet.findAll({
      include: [
        {
          model: Project,
          as: "project",
          where: { userId },
          attributes: [],
        },
      ],
      attributes: [
        "language",
        [require("sequelize").fn("COUNT", "*"), "count"],
      ],
      group: ["language"],
      order: [[require("sequelize").fn("COUNT", "*"), "DESC"]],
      limit: 1,
    });

    const mostUsedLanguage = languageStats.length > 0 ? languageStats[0].language : null;

    // Update user stats
    await UserStats.upsert({
      userId,
      totalProjects,
      totalStarsReceived,
      totalForksReceived,
      mostUsedLanguage,
      lastCalculated: new Date(),
    });

    res.json({ message: "User stats updated successfully" });
  } catch (error) {
    console.error("Update user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const followUser = async (req, res) => {
  try {
    // This is a placeholder implementation
    res.json({ message: "Follow functionality not implemented yet" });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserSnippetStats = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get snippet count for the user
    const snippetCount = await CodeSnippet.count({
      include: [{
        model: Project,
        as: 'project',
        where: { 
          userId: user.id,
          // If viewing another user's profile, only count public projects
          ...((!req.user || req.user.id !== user.id) && { isPublic: true })
        }
      }]
    });

    // Get starred snippets count for the user
    const starredCount = await Star.count({
      where: { userId: user.id, codeSnippetId: { [Op.ne]: null } }
    });

    // Get forked snippets count for the user
    const forkedCount = await CodeSnippet.count({
      include: [{
        model: Project,
        as: 'project',
        where: { userId: user.id }
      }],
      where: {
        forkedFromSnippet: { [Op.ne]: null }
      }
    });

    // Get language statistics
    const languageStats = await CodeSnippet.findAll({
      attributes: [
        'language', 
        [CodeSnippet.sequelize.fn('COUNT', CodeSnippet.sequelize.col('CodeSnippet.id')), 'count']
      ],
      include: [{
        model: Project,
        as: 'project',
        where: { 
          userId: user.id,
          // If viewing another user's profile, only count public projects
          ...((!req.user || req.user.id !== user.id) && { isPublic: true })
        },
        attributes: []
      }],
      where: {
        language: { [Op.ne]: null }
      },
      group: ['language'],
      order: [[CodeSnippet.sequelize.fn('COUNT', CodeSnippet.sequelize.col('CodeSnippet.id')), 'DESC']],
      limit: 10
    });

    // Calculate percentages and add colors
    const totalSnippets = languageStats.reduce((sum, lang) => sum + parseInt(lang.dataValues.count), 0);
    
    const languageColors = {
      'JavaScript': '#f7df1e',
      'TypeScript': '#3178c6', 
      'Python': '#3776ab',
      'Java': '#ed8b00',
      'C++': '#00599c',
      'C': '#a8b9cc',
      'C#': '#239120',
      'PHP': '#777bb4',
      'Ruby': '#cc342d',
      'Go': '#00add8',
      'Rust': '#dea584',
      'Swift': '#fa7343',
      'Kotlin': '#7f52ff',
      'Dart': '#0175c2',
      'Scala': '#dc322f',
      'R': '#276dc3',
      'Perl': '#39457e',
      'Shell': '#89e051',
      'HTML': '#e34f26',
      'CSS': '#1572b6',
      'SQL': '#e38c00',
      'JSON': '#000000',
      'XML': '#ff6600',
      'YAML': '#cb171e'
    };

    const formattedLanguageStats = languageStats.map(lang => ({
      language: lang.language,
      count: parseInt(lang.dataValues.count),
      percentage: totalSnippets > 0 ? Math.round((parseInt(lang.dataValues.count) / totalSnippets) * 100) : 0,
      color: languageColors[lang.language] || '#666666'
    }));

    res.json({
      snippetCount,
      starredCount,
      forkedCount,
      languageStats: formattedLanguageStats,
      totalSnippets
    });
  } catch (error) {
    console.error("Get user snippet stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Start a transaction for atomic deletion
    const transaction = await User.sequelize.transaction();

    try {
      console.log(`Starting account deletion for user: ${user.username} (ID: ${userId})`);

      // Delete user's collaborator relationships (both directions)
      console.log('Deleting collaborator relationships...');
      await ProjectCollaborator.destroy({
        where: { userId },
        transaction
      });

      // Delete user's stars
      console.log('Deleting user stars...');
      await Star.destroy({
        where: { userId },
        transaction
      });

      // Delete user's likes
      console.log('Deleting user likes...');
      try {
        await Like.destroy({
          where: { userId },
          transaction
        });
      } catch (error) {
        console.log('No likes table or likes to delete:', error.message);
      }

      // Delete user's comments
      console.log('Deleting user comments...');
      try {
        await Comment.destroy({
          where: { userId },
          transaction
        });
      } catch (error) {
        console.log('No comments to delete:', error.message);
      }

      // Delete all user's snippets
      console.log('Deleting user snippets...');
      await CodeSnippet.destroy({
        where: { userId },
        transaction
      });

      // Delete all user's projects
      console.log('Deleting user projects...');
      await Project.destroy({
        where: { userId },
        transaction
      });

      // Delete user's stats
      console.log('Deleting user stats...');
      await UserStats.destroy({
        where: { userId },
        transaction
      });

      // Finally, delete the user
      console.log('Deleting user account...');
      await user.destroy({ transaction });

      // Commit the transaction
      await transaction.commit();

      console.log(`User account deleted successfully: ${user.username} (ID: ${userId})`);
      res.json({ 
        success: true,
        message: "Account deleted successfully" 
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      console.error('Transaction error during user deletion:', error);
      throw error;
    }
  } catch (error) {
    console.error("Delete user error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username, bio, location, website, github, twitter, linkedin } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    // Update user profile
    await user.update({
      fullName: name || user.fullName,
      username: username || user.username,
      bio: bio !== undefined ? bio : user.bio,
      location: location !== undefined ? location : user.location,
      website: website !== undefined ? website : user.website,
      github: github !== undefined ? github : user.github,
      twitter: twitter !== undefined ? twitter : user.twitter,
      linkedin: linkedin !== undefined ? linkedin : user.linkedin,
    });

    // Return updated user without password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["passwordHash"] }
    });

    res.json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user email
const updateUserEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is taken by another user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Update email
    await user.update({ email });

    res.json({ 
      message: "Email updated successfully",
      user: { ...user.toJSON(), passwordHash: undefined }
    });
  } catch (error) {
    console.error("Update user email error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user password
const updateUserPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password (let the model hook handle hashing)
    await user.update({ passwordHash: newPassword });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update user password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  getUserProjects,
  searchUsers,
  updateUserStats,
  followUser,
  getUserSnippetStats,
  deleteUser,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
};