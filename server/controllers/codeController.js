const {
  CodeSnippet,
  Project,
  User,
  ProjectCollaborator,
} = require("../models");
const { Op } = require("sequelize");

const createCodeSnippet = async (req, res) => {
  try {
    const { projectId, title, content, language, filePath } = req.body;

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user has edit access
    const hasEditAccess =
      project.userId === req.user.id ||
      (await ProjectCollaborator.findOne({
        where: {
          projectId,
          userId: req.user.id,
          role: { [Op.in]: ["admin", "editor"] },
        },
      }));

    if (!hasEditAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    const codeSnippet = await CodeSnippet.create({
      projectId,
      title,
      content,
      language,
      filePath,
    });

    res.status(201).json({
      message: "Code snippet created successfully",
      codeSnippet,
    });
  } catch (error) {
    console.error("Create code snippet error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCodeSnippets = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { language, search } = req.query;

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check access for private projects
    if (!project.isPublic) {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const hasAccess =
        project.userId === req.user.id ||
        (await ProjectCollaborator.findOne({
          where: { projectId, userId: req.user.id },
        }));

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const whereClause = { projectId };

    if (language) {
      whereClause.language = language;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    const codeSnippets = await CodeSnippet.findAll({
      where: whereClause,
      order: [["createdAt", "ASC"]],
    });

    res.json({ codeSnippets });
  } catch (error) {
    console.error("Get code snippets error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCodeSnippetById = async (req, res) => {
  try {
    const { id } = req.params;

    const codeSnippet = await CodeSnippet.findByPk(id, {
      include: [
        {
          model: Project,
          as: "project",
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["id", "username", "avatarUrl"],
            },
          ],
        },
      ],
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Code snippet not found" });
    }

    // Check access for private projects
    if (!codeSnippet.project.isPublic) {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const hasAccess =
        codeSnippet.project.userId === req.user.id ||
        (await ProjectCollaborator.findOne({
          where: {
            projectId: codeSnippet.projectId,
            userId: req.user.id,
          },
        }));

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json({ codeSnippet });
  } catch (error) {
    console.error("Get code snippet by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCodeSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, language, filePath } = req.body;

    const codeSnippet = await CodeSnippet.findByPk(id, {
      include: [{ model: Project, as: "project" }],
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Code snippet not found" });
    }

    // Check if user has edit access
    const hasEditAccess =
      codeSnippet.project.userId === req.user.id ||
      (await ProjectCollaborator.findOne({
        where: {
          projectId: codeSnippet.projectId,
          userId: req.user.id,
          role: { [Op.in]: ["admin", "editor"] },
        },
      }));

    if (!hasEditAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    await codeSnippet.update({
      title: title || codeSnippet.title,
      content: content || codeSnippet.content,
      language: language || codeSnippet.language,
      filePath: filePath !== undefined ? filePath : codeSnippet.filePath,
    });

    res.json({
      message: "Code snippet updated successfully",
      codeSnippet,
    });
  } catch (error) {
    console.error("Update code snippet error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCodeSnippet = async (req, res) => {
  try {
    const { id } = req.params;

    const codeSnippet = await CodeSnippet.findByPk(id, {
      include: [{ model: Project, as: "project" }],
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Code snippet not found" });
    }

    // Check if user has edit access
    const hasEditAccess =
      codeSnippet.project.userId === req.user.id ||
      (await ProjectCollaborator.findOne({
        where: {
          projectId: codeSnippet.projectId,
          userId: req.user.id,
          role: { [Op.in]: ["admin", "editor"] },
        },
      }));

    if (!hasEditAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    await codeSnippet.destroy();

    res.json({ message: "Code snippet deleted successfully" });
  } catch (error) {
    console.error("Delete code snippet error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getLanguageStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check access for private projects
    if (!project.isPublic) {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const hasAccess =
        project.userId === req.user.id ||
        (await ProjectCollaborator.findOne({
          where: { projectId, userId: req.user.id },
        }));

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const languageStats = await CodeSnippet.findAll({
      where: { projectId },
      attributes: [
        "language",
        [require("sequelize").fn("COUNT", "*"), "count"],
      ],
      group: ["language"],
      order: [[require("sequelize").fn("COUNT", "*"), "DESC"]],
    });

    res.json({ languageStats });
  } catch (error) {
    console.error("Get language stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const shareCodeSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;

    const codeSnippet = await CodeSnippet.findByPk(id, {
      include: [{ model: Project, as: "project" }],
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Code snippet not found" });
    }

    // Check if user has edit access
    const hasEditAccess =
      codeSnippet.project.userId === req.user.id ||
      (await ProjectCollaborator.findOne({
        where: {
          projectId: codeSnippet.projectId,
          userId: req.user.id,
          role: { [Op.in]: ["admin", "editor"] },
        },
      }));

    if (!hasEditAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    await codeSnippet.update({ isPublic });

    res.json({
      message: "Code snippet visibility updated successfully",
      codeSnippet,
    });
  } catch (error) {
    console.error("Share code snippet error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPublicCodeSnippet = async (req, res) => {
  try {
    const { id } = req.params;

    const codeSnippet = await CodeSnippet.findOne({
      where: { id, isPublic: true },
      include: [
        {
          model: Project,
          as: "project",
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["id", "username", "avatarUrl"],
            },
          ],
        },
      ],
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Public code snippet not found" });
    }

    res.json({ codeSnippet });
  } catch (error) {
    console.error("Get public code snippet error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateSnippetVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;

    const codeSnippet = await CodeSnippet.findByPk(id, {
      include: [{ model: Project, as: "project" }],
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Code snippet not found" });
    }

    // Check if user has edit access
    const hasEditAccess =
      codeSnippet.project.userId === req.user.id ||
      (await ProjectCollaborator.findOne({
        where: {
          projectId: codeSnippet.projectId,
          userId: req.user.id,
          role: { [Op.in]: ["admin", "editor"] },
        },
      }));

    if (!hasEditAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    await codeSnippet.update({ isPublic });

    res.json({
      message: "Code snippet visibility updated successfully",
      codeSnippet,
    });
  } catch (error) {
    console.error("Update snippet visibility error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCodeSnippet,
  getCodeSnippets,
  getCodeSnippetById,
  updateCodeSnippet,
  deleteCodeSnippet,
  getLanguageStats,
  shareCodeSnippet,
  getPublicCodeSnippet,
  updateSnippetVisibility,
};