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
