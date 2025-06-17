const { Op } = require("sequelize");
const {
  User,
  Project,
  Star,
  ProjectCollaborator,
  UserStats,
  CodeSnippet,
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
    const { username } = req.params;

    const userToFollow = await User.findOne({ where: { username } });

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToFollow.id === req.user.id) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    // Note: You'll need to create a Follow model for this functionality
    // This is a placeholder implementation
    res.json({ message: "Follow functionality not implemented yet" });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  getUserProjects,
  searchUsers,
  updateUserStats,
  followUser,
};