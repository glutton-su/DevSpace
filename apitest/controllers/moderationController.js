const { User, Project } = require("../models/index.js");
const { Op } = require("sequelize");

exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.update({ isSuspended: true });
    res.json({ message: "User suspended" });
  } catch (e) {
    next(e);
  }
};

exports.unsuspendUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.update({ isSuspended: false });
    res.json({ message: "User unsuspended" });
  } catch (e) {
    next(e);
  }
};

exports.deleteProjectModeration = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    await project.destroy();
    res.json({ message: "Project deleted" });
  } catch (e) {
    next(e);
  }
};

exports.listReports = async (req, res, next) => {
  try {
    // Report model doesn't exist, so return empty array for now
    res.json({ reports: [] });
  } catch (e) {
    next(e);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { role } = req.body;
    if (!role || !["user", "moderator", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    await user.update({ role });
    res.json({ message: `User role updated to ${role}` });
  } catch (e) {
    next(e);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (e) {
    next(e);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = search 
      ? {
          [Op.or]: [
            { username: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { fullName: { [Op.iLike]: `%${search}%` } }
          ]
        }
      : {};
    
    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'username', 'email', 'fullName', 'role', 'isSuspended', 'createdAt', 'lastLogin']
    });
    
    res.json({
      users: users.rows,
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / limit)
    });
  } catch (e) {
    next(e);
  }
};
