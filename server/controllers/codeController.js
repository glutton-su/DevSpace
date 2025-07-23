const {
  CodeSnippet,
  Project,
  User,
  ProjectCollaborator,
  CodeSnippetCollaborator,
  Star,
  Like,
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
    res.status(500).json({ message: "Server error", error: error.message });
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

// Get user's own snippets
const getUserOwnedSnippets = async (req, res) => {
  try {
    const { language, search, page = 1, limit = 20, includeArchived = false } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};

    if (language) {
      whereClause.language = language;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    const snippets = await CodeSnippet.findAndCountAll({
      where: whereClause,
      include: [{
        model: Project,
        as: 'project',
        where: { userId: req.user.id },
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'avatarUrl', 'fullName']
        }]
      }],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({ 
      snippets: snippets.rows,
      total: snippets.count,
      page: parseInt(page),
      totalPages: Math.ceil(snippets.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error getting user owned snippets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's starred snippets
const getUserStarredSnippets = async (req, res) => {
  try {
    const { language, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};

    if (language) {
      whereClause.language = language;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    const starredSnippets = await CodeSnippet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'avatarUrl', 'fullName']
          }]
        },
        {
          model: Star,
          as: 'stars',
          where: { userId: req.user.id },
          attributes: ['starredAt']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({ 
      snippets: starredSnippets.rows,
      total: starredSnippets.count,
      page: parseInt(page),
      totalPages: Math.ceil(starredSnippets.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error getting user starred snippets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's forked snippets
const getUserForkedSnippets = async (req, res) => {
  try {
    const { language, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      forkedFromSnippet: { [Op.not]: null }
    };

    if (language) {
      whereClause.language = language;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    const forkedSnippets = await CodeSnippet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          where: { userId: req.user.id },
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'avatarUrl', 'fullName']
          }]
        },
        {
          model: CodeSnippet,
          as: 'originalSnippet',
          include: [{
            model: Project,
            as: 'project',
            include: [{
              model: User,
              as: 'owner',
              attributes: ['id', 'username', 'avatarUrl', 'fullName']
            }]
          }]
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({ 
      snippets: forkedSnippets.rows,
      total: forkedSnippets.count,
      page: parseInt(page),
      totalPages: Math.ceil(forkedSnippets.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error getting user forked snippets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle star on code snippet
const toggleSnippetStar = async (req, res) => {
  try {
    const snippetId = req.params.id;
    const userId = req.user.id;

    const snippet = await CodeSnippet.findByPk(snippetId);
    if (!snippet) {
      return res.status(404).json({ message: 'Code snippet not found' });
    }

    const existingStar = await Star.findOne({
      where: { userId, codeSnippetId: snippetId }
    });

    let isStarred;
    if (existingStar) {
      await existingStar.destroy();
      isStarred = false;
    } else {
      await Star.create({ userId, codeSnippetId: snippetId });
      isStarred = true;
    }

    // Get updated star count
    const starCount = await Star.count({
      where: { codeSnippetId: snippetId }
    });

    console.log('Star toggle - snippetId:', snippetId, 'isStarred:', isStarred, 'starCount:', starCount);

    res.json({ 
      message: isStarred ? 'Star added' : 'Star removed', 
      isStarred,
      starCount
    });
  } catch (error) {
    console.error('Error toggling star:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle like on code snippet
const toggleSnippetLike = async (req, res) => {
  try {
    const snippetId = req.params.id;
    const userId = req.user.id;

    const snippet = await CodeSnippet.findByPk(snippetId);
    if (!snippet) {
      return res.status(404).json({ message: 'Code snippet not found' });
    }

    const existingLike = await Like.findOne({
      where: { userId, codeSnippetId: snippetId }
    });

    if (existingLike) {
      await existingLike.destroy();
      res.json({ message: 'Like removed', isLiked: false });
    } else {
      await Like.create({ userId, codeSnippetId: snippetId });
      res.json({ message: 'Like added', isLiked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fork code snippet
const forkCodeSnippet = async (req, res) => {
  try {
    const snippetId = req.params.id;
    const userId = req.user.id;

    const originalSnippet = await CodeSnippet.findByPk(snippetId, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!originalSnippet) {
      return res.status(404).json({ message: 'Code snippet not found' });
    }

    // Create a project for the forked snippet if user doesn't have a default one
    let userProject = await Project.findOne({
      where: { userId, title: 'Forked Snippets' }
    });

    if (!userProject) {
      userProject = await Project.create({
        userId,
        title: 'Forked Snippets',
        description: 'Collection of forked code snippets',
        isPublic: false
      });
    }

    // Create the forked snippet
    const forkedSnippet = await CodeSnippet.create({
      projectId: userProject.id,
      title: `${originalSnippet.title} (Fork)`,
      content: originalSnippet.content,
      language: originalSnippet.language,
      filePath: originalSnippet.filePath,
      isPublic: false,
      forkedFromSnippet: snippetId,
      forkedFromProject: originalSnippet.projectId
    });

    const snippetWithProject = await CodeSnippet.findByPk(forkedSnippet.id, {
      include: [{
        model: Project,
        as: 'project',
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'avatarUrl', 'fullName']
        }]
      }]
    });

    res.json({ 
      message: 'Snippet forked successfully',
      snippet: snippetWithProject
    });
  } catch (error) {
    console.error('Error forking snippet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get public snippets
const getPublicSnippets = async (req, res) => {
  try {
    console.log('getPublicSnippets called with user:', req.user?.id || 'unauthenticated');
    
    const { language, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { isPublic: true };

    if (language) {
      whereClause.language = language;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    const snippets = await CodeSnippet.findAndCountAll({
      where: whereClause,
      include: [{
        model: Project,
        as: 'project',
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'avatarUrl', 'fullName']
        }]
      }],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    console.log('Found snippets:', snippets.rows.length);

    // Add star/like data to snippets
    const enrichedSnippets = await Promise.all(snippets.rows.map(async (snippet) => {
      const snippetData = snippet.toJSON();
      
      try {
        // Get actual star and like counts
        const starCount = await Star.count({
          where: { codeSnippetId: snippet.id }
        });
        const likeCount = await Like.count({
          where: { codeSnippetId: snippet.id }
        });
        
        snippetData.starCount = starCount;
        snippetData.likeCount = likeCount;
        
        // If user is authenticated, check their star/like status
        if (req.user) {
          const userStar = await Star.findOne({
            where: { userId: req.user.id, codeSnippetId: snippet.id }
          });
          const userLike = await Like.findOne({
            where: { userId: req.user.id, codeSnippetId: snippet.id }
          });
          
          snippetData.isStarred = !!userStar;
          snippetData.isLiked = !!userLike;
        } else {
          snippetData.isStarred = false;
          snippetData.isLiked = false;
        }
      } catch (error) {
        console.error('Error enriching snippet:', snippet.id, error);
        // Fallback to default values
        snippetData.starCount = 0;
        snippetData.likeCount = 0;
        snippetData.isStarred = false;
        snippetData.isLiked = false;
      }
      
      return snippetData;
    }));

    res.json({ 
      snippets: enrichedSnippets,
      total: snippets.count,
      page: parseInt(page),
      totalPages: Math.ceil(snippets.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error getting public snippets:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add snippet collaborator
const addSnippetCollaborator = async (req, res) => {
  try {
    const snippetId = req.params.id;
    const { username, role = 'viewer' } = req.body;

    const snippet = await CodeSnippet.findByPk(snippetId, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check if user owns the snippet or has admin access
    if (snippet.project.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const collaborator = await User.findOne({ where: { username } });
    if (!collaborator) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingCollaborator = await CodeSnippetCollaborator.findOne({
      where: { codeSnippetId: snippetId, userId: collaborator.id }
    });

    if (existingCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    await CodeSnippetCollaborator.create({
      codeSnippetId: snippetId,
      userId: collaborator.id,
      role
    });

    res.json({ message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove snippet collaborator
const removeSnippetCollaborator = async (req, res) => {
  try {
    const snippetId = req.params.id;
    const { userId } = req.body;

    const snippet = await CodeSnippet.findByPk(snippetId, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if (snippet.project.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await CodeSnippetCollaborator.destroy({
      where: { codeSnippetId: snippetId, userId }
    });

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get snippet collaborators
const getSnippetCollaborators = async (req, res) => {
  try {
    const snippetId = req.params.id;

    const collaborators = await CodeSnippetCollaborator.findAll({
      where: { codeSnippetId: snippetId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'fullName', 'avatarUrl']
      }]
    });

    res.json({ collaborators });
  } catch (error) {
    console.error('Error getting collaborators:', error);
    res.status(500).json({ message: 'Server error' });
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
  getUserOwnedSnippets,
  getUserStarredSnippets,
  getUserForkedSnippets,
  toggleSnippetStar,
  toggleSnippetLike,
  forkCodeSnippet,
  getPublicSnippets,
  addSnippetCollaborator,
  removeSnippetCollaborator,
  getSnippetCollaborators,
};