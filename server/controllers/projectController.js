const { Op } = require("sequelize");
const {
  Project,
  User,
  CodeSnippet,
  Star,
  Tag,
  ProjectTag,
  ProjectCollaborator,
  Comment,
  Notification,
} = require("../models");

const createProject = async (req, res) => {
  try {
    const { title, description, isPublic, isCollaborative, tags } = req.body;

    const project = await Project.create({
      userId: req.user.id,
      title,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      isCollaborative: isCollaborative || false,
    });

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.toLowerCase() },
            defaults: { name: tagName.toLowerCase() },
          });
          return tag;
        })
      );

      await project.addTags(tagInstances);
    }

    // Fetch the created project with associations
    const createdProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: "owner", attributes: ["id", "username", "avatarUrl"] },
        { model: Tag, as: "tags" },
      ],
    });

    res.status(201).json({
      message: "Project created successfully",
      project: createdProject,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      language,
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isPublic: true };

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Build include array
    const includeArray = [
      { model: User, as: "owner", attributes: ["id", "username", "avatarUrl"] },
      { model: Tag, as: "tags" },
    ];

    // Language filter
    if (language) {
      includeArray.push({
        model: CodeSnippet,
        as: "codeSnippets",
        where: { language },
        required: true,
        attributes: [],
      });
    }

    const { count, rows: projects } = await Project.findAndCountAll({
      where: whereClause,
      include: includeArray,
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    // Filter by tags if provided
    let filteredProjects = projects;
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      filteredProjects = projects.filter((project) =>
        project.tags.some((tag) => tagArray.includes(tag.name))
      );
    }

    res.json({
      projects: filteredProjects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: "owner", attributes: ["id", "username", "avatarUrl"] },
        { model: Tag, as: "tags" },
        {
          model: CodeSnippet,
          as: "codeSnippets",
          order: [["createdAt", "ASC"]],
        },
        {
          model: ProjectCollaborator,
          as: "collaborators",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username", "avatarUrl"],
            },
          ],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username", "avatarUrl"],
            },
          ],
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user has access to private project
    if (!project.isPublic) {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const hasAccess =
        project.userId === req.user.id ||
        project.collaborators.some((collab) => collab.userId === req.user.id);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Check if current user has starred the project
    let isStarred = false;
    if (req.user) {
      const star = await Star.findOne({
        where: { userId: req.user.id, projectId: project.id },
      });
      isStarred = !!star;
    }

    res.json({
      project: {
        ...project.toJSON(),
        isStarred,
      },
    });
  } catch (error) {
    console.error("Get project by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isPublic, isCollaborative, tags } = req.body;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user owns the project or is an admin collaborator
    const hasEditAccess =
      project.userId === req.user.id ||
      (await ProjectCollaborator.findOne({
        where: {
          projectId: id,
          userId: req.user.id,
          role: { [Op.in]: ["admin", "editor"] },
        },
      }));

    if (!hasEditAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update project
    await project.update({
      title: title || project.title,
      description: description !== undefined ? description : project.description,
      isPublic: isPublic !== undefined ? isPublic : project.isPublic,
      isCollaborative:
        isCollaborative !== undefined ? isCollaborative : project.isCollaborative,
    });

    // Update tags if provided
    if (tags) {
      await ProjectTag.destroy({ where: { projectId: id } });

      if (tags.length > 0) {
        const tagInstances = await Promise.all(
          tags.map(async (tagName) => {
            const [tag] = await Tag.findOrCreate({
              where: { name: tagName.toLowerCase() },
              defaults: { name: tagName.toLowerCase() },
            });
            return tag;
          })
        );

        await project.addTags(tagInstances);
      }
    }

    // Fetch updated project
    const updatedProject = await Project.findByPk(id, {
      include: [
        { model: User, as: "owner", attributes: ["id", "username", "avatarUrl"] },
        { model: Tag, as: "tags" },
      ],
    });

    res.json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only owner can delete project
    if (project.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await project.destroy();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const starProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const [star, created] = await Star.findOrCreate({
      where: { userId: req.user.id, projectId: id },
      defaults: { userId: req.user.id, projectId: id },
    });

    if (!created) {
      return res.status(400).json({ message: "Project already starred" });
    }

    // Update star count
    await project.increment("starCount");

    // Create notification for project owner
    if (project.userId !== req.user.id) {
      await Notification.create({
        userId: project.userId,
        type: "star",
        title: "Project Starred",
        message: `${req.user.username} starred your project "${project.title}"`,
        relatedId: project.id,
      });
    }

    res.json({ message: "Project starred successfully" });
  } catch (error) {
    console.error("Star project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const unstarProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const star = await Star.findOne({
      where: { userId: req.user.id, projectId: id },
    });

    if (!star) {
      return res.status(400).json({ message: "Project not starred" });
    }

    await star.destroy();

    // Update star count
    await project.decrement("starCount");

    res.json({ message: "Project unstarred successfully" });
  } catch (error) {
    console.error("Unstar project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const forkProject = async (req, res) => {
  try {
    const { id } = req.params;

    const originalProject = await Project.findByPk(id, {
      include: [
        { model: CodeSnippet, as: "codeSnippets" },
        { model: Tag, as: "tags" },
      ],
    });

    if (!originalProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!originalProject.isPublic) {
      return res.status(403).json({ message: "Cannot fork private project" });
    }

    // Create forked project
    const forkedProject = await Project.create({
      userId: req.user.id,
      title: `${originalProject.title} (Fork)`,
      description: originalProject.description,
      isPublic: true,
      isCollaborative: false,
      forkedFrom: originalProject.id,
    });

    // Copy code snippets
    if (originalProject.codeSnippets.length > 0) {
      const codeSnippetData = originalProject.codeSnippets.map((snippet) => ({
        projectId: forkedProject.id,
        title: snippet.title,
        content: snippet.content,
        language: snippet.language,
        filePath: snippet.filePath,
      }));

      await CodeSnippet.bulkCreate(codeSnippetData);
    }

    // Copy tags
    if (originalProject.tags.length > 0) {
      await forkedProject.addTags(originalProject.tags);
    }

    // Update fork count
    await originalProject.increment("forkCount");

    // Create notification for original project owner
    if (originalProject.userId !== req.user.id) {
      await Notification.create({
        userId: originalProject.userId,
        type: "fork",
        title: "Project Forked",
        message: `${req.user.username} forked your project "${originalProject.title}"`,
        relatedId: originalProject.id,
      });
    }

    // Fetch the forked project with associations
    const createdFork = await Project.findByPk(forkedProject.id, {
      include: [
        { model: User, as: "owner", attributes: ["id", "username", "avatarUrl"] },
        { model: Tag, as: "tags" },
        { model: CodeSnippet, as: "codeSnippets" },
      ],
    });

    res.status(201).json({
      message: "Project forked successfully",
      project: createdFork,
    });
  } catch (error) {
    console.error("Fork project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  starProject,
  unstarProject,
  forkProject,
};