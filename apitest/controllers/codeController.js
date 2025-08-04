const {
  CodeSnippet,
  Project,
  User,
  ProjectCollaborator,
  CodeSnippetCollaborator,
  Star,
  Tag,
} = require("../models");
const { Op } = require("sequelize");

const createCodeSnippet = async (req, res) => {
  try {
    console.log('🚀 Creating code snippet - Request body:', JSON.stringify(req.body, null, 2));
    console.log('🚀 Creating code snippet - User ID:', req.user?.id);
    
    let { projectId, title, content, language, filePath, tags, allowCollaboration, isPublic } = req.body;

    // If no projectId provided, create a default project
    if (!projectId) {
      console.log('🚀 No projectId provided, creating default project');
      const defaultProject = await Project.create({
        userId: req.user.id,
        title: `${title} - Project`,
        description: 'Auto-generated project for snippet',
        isPublic: isPublic !== undefined ? isPublic : false,
        isCollaborative: allowCollaboration || false,
      });
      projectId = defaultProject.id;
      console.log('🚀 Created default project with ID:', projectId);
    }

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
      allowCollaboration: allowCollaboration || false,
      isPublic: isPublic !== undefined ? isPublic : false,
    });

    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      console.log('🏷️  Processing tags:', tags);
      for (const tagName of tags) {
        if (tagName.trim()) {
          console.log(`🏷️  Processing tag: "${tagName.trim()}"`);
          // Find or create tag
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim().toLowerCase() }
          });
          console.log(`🏷️  Tag found/created:`, tag.id, tag.name);
          
          // Associate tag with snippet
          await codeSnippet.addTag(tag);
          console.log(`🏷️  Tag associated with snippet`);
        }
      }
    } else {
      console.log('🏷️  No tags provided or tags is not an array:', tags);
    }

    // Fetch the snippet with tags included
    const snippetWithTags = await CodeSnippet.findByPk(codeSnippet.id, {
      include: [{ model: Tag, as: 'tags' }]
    });

    console.log('🏷️  Final snippet with tags:', {
      id: snippetWithTags.id,
      title: snippetWithTags.title,
      tags: snippetWithTags.tags
    });

    res.status(201).json({
      message: "Code snippet created successfully",
      codeSnippet: snippetWithTags,
    });
  } catch (error) {
    console.error("❌ Create code snippet error:", error);
    console.error("❌ Full error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'SequelizeValidationError') {
      console.error("❌ Validation errors:", error.errors);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors.map(e => e.message)
      });
    }
    
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
            {
              model: ProjectCollaborator,
              as: "collaborators",
              include: [{
                model: User,
                as: "user",
                attributes: ["id", "username", "fullName", "avatarUrl"]
              }]
            }
          ],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name']
        }
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

      // For forked snippets, check if the current user is the owner of the project
      // (i.e., they forked this snippet into their own project)
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

    // Enrich with star and fork counts
    const snippetData = codeSnippet.toJSON();
    
    try {
      // Get actual star count
      const starCount = await Star.count({
        where: { codeSnippetId: codeSnippet.id }
      });
      
      snippetData.starCount = starCount;
      
      // Get fork count
      const forkCount = await CodeSnippet.count({
        where: { forkedFromSnippet: codeSnippet.id }
      });
      
      snippetData.forkCount = forkCount;
      
      // If user is authenticated, check their star status and collaboration status
      if (req.user) {
        const userStar = await Star.findOne({
          where: { userId: req.user.id, codeSnippetId: codeSnippet.id }
        });
        
        snippetData.isStarred = !!userStar;
        
        // Check if user is a project collaborator (for collaborative snippets)
        const userCollaboration = await ProjectCollaborator.findOne({
          where: { userId: req.user.id, projectId: codeSnippet.projectId }
        });
        
        snippetData.isCollaborator = !!userCollaboration;
        snippetData.collaboratorRole = userCollaboration?.role || null;
      } else {
        snippetData.isStarred = false;
        snippetData.isCollaborator = false;
        snippetData.collaboratorRole = null;
      }
    } catch (error) {
      console.error('Error enriching snippet:', codeSnippet.id, error);
      // Fallback to default values
      snippetData.starCount = 0;
      snippetData.forkCount = 0;
      snippetData.isStarred = false;
    }

    res.json({ codeSnippet: snippetData });
  } catch (error) {
    console.error("Get code snippet by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCodeSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, language, filePath, tags, allowCollaboration, isPublic } = req.body;

    const codeSnippet = await CodeSnippet.findByPk(id, {
      include: [{ model: Project, as: "project" }],
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Code snippet not found" });
    }

    // Check if user has edit access (owner or project collaborator)
    const isOwner = codeSnippet.project.userId === req.user.id;
    const isProjectCollaborator = await ProjectCollaborator.findOne({
      where: {
        projectId: codeSnippet.projectId,
        userId: req.user.id,
        role: { [Op.in]: ["admin", "editor"] },
      },
    });

    // Only owners and actual project collaborators can edit
    const hasEditAccess = isOwner || isProjectCollaborator;

    if (!hasEditAccess) {
      return res.status(403).json({ message: "Access denied. You must be a project collaborator to edit this snippet." });
    }

    await codeSnippet.update({
      title: title || codeSnippet.title,
      content: content || codeSnippet.content,
      language: language || codeSnippet.language,
      filePath: filePath !== undefined ? filePath : codeSnippet.filePath,
      allowCollaboration: allowCollaboration !== undefined ? allowCollaboration : codeSnippet.allowCollaboration,
      isPublic: isPublic !== undefined ? isPublic : codeSnippet.isPublic,
    });

    // Handle tags update if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await codeSnippet.setTags([]);
      
      // Add new tags
      for (const tagName of tags) {
        if (tagName.trim()) {
          // Find or create tag
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim().toLowerCase() }
          });
          
          // Associate tag with snippet
          await codeSnippet.addTag(tag);
        }
      }
    }

    // Fetch the updated snippet with tags included
    const updatedSnippet = await CodeSnippet.findByPk(id, {
      include: [
        { model: Project, as: "project" },
        { model: Tag, as: 'tags', attributes: ['name'] }
      ]
    });

    res.json({
      message: "Code snippet updated successfully",
      codeSnippet: updatedSnippet,
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

    // Add condition to exclude forked snippets from owned snippets
    whereClause.forkedFromSnippet = null;
    whereClause.forkedFromProject = null;

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
      }, {
        model: Tag,
        as: 'tags',
        attributes: ['name']
      }],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Add star data to snippets like in getPublicSnippets
    const enrichedSnippets = await Promise.all(snippets.rows.map(async (snippet) => {
      const snippetData = snippet.toJSON();
      
      try {
        // Get actual star count
        const starCount = await Star.count({
          where: { codeSnippetId: snippet.id }
        });
        
        snippetData.starCount = starCount;
        
        // Get fork count
        const forkCount = await CodeSnippet.count({
          where: { forkedFromSnippet: snippet.id }
        });
        
        snippetData.forkCount = forkCount;
        
        // Check user's star status
        const userStar = await Star.findOne({
          where: { userId: req.user.id, codeSnippetId: snippet.id }
        });
        
        snippetData.isStarred = !!userStar;
      } catch (error) {
        console.error('Error enriching snippet:', snippet.id, error);
        // Fallback to default values
        snippetData.starCount = 0;
        snippetData.forkCount = 0;
        snippetData.isStarred = false;
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

    // Add star data to snippets
    const enrichedSnippets = await Promise.all(starredSnippets.rows.map(async (snippet) => {
      const snippetData = snippet.toJSON();
      
      try {
        // Get actual star count
        const starCount = await Star.count({
          where: { codeSnippetId: snippet.id }
        });
        
        snippetData.starCount = starCount;
        
        // Get fork count
        const forkCount = await CodeSnippet.count({
          where: { forkedFromSnippet: snippet.id }
        });
        
        snippetData.forkCount = forkCount;
        snippetData.isStarred = true; // User starred this snippet
      } catch (error) {
        console.error('Error enriching starred snippet:', snippet.id, error);
        // Fallback to default values
        snippetData.starCount = 0;
        snippetData.forkCount = 0;
        snippetData.isStarred = true;
      }
      
      return snippetData;
    }));

    res.json({ 
      snippets: enrichedSnippets,
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
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Add star data to forked snippets like in other functions
    const enrichedSnippets = await Promise.all(forkedSnippets.rows.map(async (snippet) => {
      const snippetData = snippet.toJSON();
      
      try {
        // Get actual star count
        const starCount = await Star.count({
          where: { codeSnippetId: snippet.id }
        });
        
        snippetData.starCount = starCount;
        
        // Get fork count
        const forkCount = await CodeSnippet.count({
          where: { forkedFromSnippet: snippet.id }
        });
        
        snippetData.forkCount = forkCount;
        
        // Check user's star status
        const userStar = await Star.findOne({
          where: { userId: req.user.id, codeSnippetId: snippet.id }
        });
        
        snippetData.isStarred = !!userStar;
      } catch (error) {
        console.error('Error enriching forked snippet:', snippet.id, error);
        // Fallback to default values
        snippetData.starCount = 0;
        snippetData.forkCount = 0;
        snippetData.isStarred = false;
      }
      
      return snippetData;
    }));

    res.json({ 
      snippets: enrichedSnippets,
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
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] }
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    console.log('Found snippets:', snippets.rows.length);

    // Add star data to snippets
    const enrichedSnippets = await Promise.all(snippets.rows.map(async (snippet) => {
      const snippetData = snippet.toJSON();
      
      try {
        // Get actual star count
        const starCount = await Star.count({
          where: { codeSnippetId: snippet.id }
        });
        
        snippetData.starCount = starCount;
        
        // Get fork count
        const forkCount = await CodeSnippet.count({
          where: { forkedFromSnippet: snippet.id }
        });
        
        snippetData.forkCount = forkCount;
        
        // If user is authenticated, check their star status
        if (req.user) {
          const userStar = await Star.findOne({
            where: { userId: req.user.id, codeSnippetId: snippet.id }
          });
          
          snippetData.isStarred = !!userStar;
        } else {
          snippetData.isStarred = false;
        }
        
        // Transform tags to array of strings for frontend consistency
        if (snippetData.tags) {
          snippetData.tags = snippetData.tags.map(tag => typeof tag === 'string' ? tag : tag.name);
        }
      } catch (error) {
        console.error('Error enriching snippet:', snippet.id, error);
        // Fallback to default values
        snippetData.starCount = 0;
        snippetData.forkCount = 0;
        snippetData.isStarred = false;
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

// Get collaborative snippets (public snippets with allowCollaboration: true)
const getCollaborativeSnippets = async (req, res) => {
  try {
    console.log('getCollaborativeSnippets called with user:', req.user?.id || 'unauthenticated');
    
    const { language, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { 
      isPublic: true, 
      allowCollaboration: true 
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

    const snippets = await CodeSnippet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'username', 'avatarUrl', 'fullName']
            },
            {
              model: ProjectCollaborator,
              as: 'collaborators',
              include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'fullName', 'avatarUrl']
              }]
            }
          ]
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] }
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    console.log('Found collaborative snippets:', snippets.rows.length);

    // Add star data to snippets
    const enrichedSnippets = await Promise.all(snippets.rows.map(async (snippet) => {
      const snippetData = snippet.toJSON();
      
      try {
        // Get actual star count
        const starCount = await Star.count({
          where: { codeSnippetId: snippet.id }
        });
        
        snippetData.starCount = starCount;
        
        // Get fork count
        const forkCount = await CodeSnippet.count({
          where: { forkedFromSnippet: snippet.id }
        });
        
        snippetData.forkCount = forkCount;
        
        // If user is authenticated, check their star status
        if (req.user) {
          const userStar = await Star.findOne({
            where: { userId: req.user.id, codeSnippetId: snippet.id }
          });
          
          snippetData.isStarred = !!userStar;
        } else {
          snippetData.isStarred = false;
        }
        
        // Transform tags to array of strings for frontend
        if (snippetData.tags) {
          snippetData.tags = snippetData.tags.map(tag => tag.name);
        }
        
        // Add author info for frontend compatibility
        if (snippetData.project && snippetData.project.owner) {
          snippetData.author = {
            id: snippetData.project.owner.id,
            username: snippetData.project.owner.username,
            name: snippetData.project.owner.fullName || snippetData.project.owner.username,
            avatarUrl: snippetData.project.owner.avatarUrl
          };
        }
        
      } catch (error) {
        console.error('Error enriching collaborative snippet:', snippet.id, error);
        // Fallback to default values
        snippetData.starCount = 0;
        snippetData.forkCount = 0;
        snippetData.isStarred = false;
        snippetData.tags = [];
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
    console.error('Error getting collaborative snippets:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add snippet collaborator (now adds to project collaboration group)
const addSnippetCollaborator = async (req, res) => {
  try {
    const snippetId = req.params.id;
    const { username, role = 'editor' } = req.body;

    const snippet = await CodeSnippet.findByPk(snippetId, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check if snippet allows collaboration
    if (!snippet.allowCollaboration || !snippet.isPublic) {
      return res.status(400).json({ message: 'This snippet does not allow collaboration' });
    }

    // Check if user can join collaboration:
    // 1. Snippet owner can add anyone
    // 2. For collaborative snippets, users can add themselves to the project group
    const isOwner = snippet.project.userId === req.user.id;
    const isSelfCollaboration = username === req.user.username;
    
    if (!isOwner && !isSelfCollaboration) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const collaborator = await User.findOne({ where: { username } });
    if (!collaborator) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a project collaborator
    const existingProjectCollaborator = await ProjectCollaborator.findOne({
      where: { projectId: snippet.projectId, userId: collaborator.id }
    });

    if (existingProjectCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator on this project' });
    }

    // Add user as project collaborator (this gives them access to all collaborative snippets in the project)
    await ProjectCollaborator.create({
      projectId: snippet.projectId,
      userId: collaborator.id,
      role: 'editor' // Always give editor role for collaborative access
    });

    res.json({ 
      message: 'Successfully joined project collaboration group',
      collaborator: {
        id: collaborator.id,
        username: collaborator.username,
        role: 'editor'
      }
    });
  } catch (error) {
    console.error('Error adding to collaboration group:', error);
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

    // Only the project owner can remove collaborators
    if (snippet.project.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove from project collaborators (this affects all collaborative snippets in the project)
    const removed = await ProjectCollaborator.destroy({
      where: { projectId: snippet.projectId, userId }
    });

    if (removed === 0) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }

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

// Request collaboration access (user requests to become a collaborator)
const requestSnippetCollaboration = async (req, res) => {
  try {
    const snippetId = req.params.id;
    const userId = req.user.id;

    const snippet = await CodeSnippet.findByPk(snippetId, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check if snippet allows collaboration
    if (!snippet.allowCollaboration) {
      return res.status(400).json({ message: 'This snippet does not allow collaboration' });
    }

    // Check if user is not the owner
    if (snippet.project.userId === userId) {
      return res.status(400).json({ message: 'You cannot request collaboration on your own snippet' });
    }

    // Check if user is already a collaborator
    const existingCollaborator = await CodeSnippetCollaborator.findOne({
      where: { codeSnippetId: snippetId, userId }
    });

    if (existingCollaborator) {
      return res.status(400).json({ message: 'You are already a collaborator on this snippet' });
    }

    // Auto-approve collaboration request and add user as editor
    await CodeSnippetCollaborator.create({
      codeSnippetId: snippetId,
      userId,
      role: 'editor'
    });

    res.json({ message: 'Collaboration access granted successfully' });
  } catch (error) {
    console.error('Error requesting collaboration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get public snippets by a specific user
const getUserPublicSnippets = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // First, find the user
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'fullName']
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get public snippets for this user through their projects
    const snippets = await CodeSnippet.findAndCountAll({
      where: { isPublic: true },
      include: [
        {
          model: Project,
          as: 'project',
          where: { userId: user.id },
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'avatarUrl', 'fullName']
          }]
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          through: { attributes: [] }
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Add star data to snippets (similar to getPublicSnippets)
    const enrichedSnippets = await Promise.all(snippets.rows.map(async (snippet) => {
      const snippetData = snippet.toJSON();
      
      // Get star count
      const starCount = await Star.count({
        where: { codeSnippetId: snippet.id }
      });

      // Check if current user has starred (if authenticated)
      let isStarred = false;
      if (req.user) {
        const userStar = await Star.findOne({
          where: { 
            codeSnippetId: snippet.id,
            userId: req.user.id
          }
        });
        isStarred = !!userStar;
      }

      return {
        ...snippetData,
        starCount,
        isStarred,
        author: snippetData.project?.owner || { username: 'Unknown' }
      };
    }));

    res.json({
      snippets: enrichedSnippets,
      total: snippets.count,
      page: parseInt(page),
      totalPages: Math.ceil(snippets.count / parseInt(limit))
    });
  } catch (error) {
    console.error("Get user public snippets error:", error);
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
  getUserOwnedSnippets,
  getUserStarredSnippets,
  getUserForkedSnippets,
  toggleSnippetStar,
  forkCodeSnippet,
  getPublicSnippets,
  getUserPublicSnippets,
  getCollaborativeSnippets,
  addSnippetCollaborator,
  requestSnippetCollaboration,
  removeSnippetCollaborator,
  getSnippetCollaborators,
  requestSnippetCollaboration,
};