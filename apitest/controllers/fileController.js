const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const { File, User, Project, ProjectCollaborator } = require("../models");
const { Op } = require("sequelize");

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { filename, originalname, size, mimetype, path: filePath } = req.file;

    // Process image with Sharp (resize and optimize)
    const processedPath = `uploads/avatars/processed_${filename}`;
    
    await sharp(filePath)
      .resize(200, 200, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(processedPath);

    // Delete original file
    await fs.unlink(filePath);

    // Delete old avatar if exists
    const oldAvatar = await File.findOne({
      where: { userId: req.user.id, fileType: "avatar" },
    });

    if (oldAvatar) {
      try {
        await fs.unlink(oldAvatar.filePath);
        await oldAvatar.destroy();
      } catch (error) {
        console.error("Error deleting old avatar:", error);
      }
    }

    // Save file record
    const fileRecord = await File.create({
      userId: req.user.id,
      originalName: originalname,
      fileName: `processed_${filename}`,
      filePath: processedPath,
      fileSize: size,
      mimeType: "image/jpeg",
      fileType: "avatar",
      isPublic: true,
    });

    // Update user avatar URL
    await User.update(
      { avatarUrl: `/api/files/${fileRecord.id}` },
      { where: { id: req.user.id } }
    );

    res.json({
      message: "Avatar uploaded successfully",
      file: {
        id: fileRecord.id,
        url: `/api/files/${fileRecord.id}`,
        originalName: fileRecord.originalName,
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    // Clean up file if upload failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }
    res.status(500).json({ message: "Server error" });
  }
};

const uploadCodeFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Verify project access
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const hasAccess =
      project.userId === req.user.id ||
      (await ProjectCollaborator.findOne({
        where: {
          projectId,
          userId: req.user.id,
          role: { [Op.in]: ["admin", "editor"] },
        },
      }));

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const { filename, originalname, size, mimetype, path: filePath } = file;

      // Read file content
      const content = await fs.readFile(filePath, "utf-8");

      // Create file record
      const fileRecord = await File.create({
        userId: req.user.id,
        projectId,
        originalName: originalname,
        fileName: filename,
        filePath,
        fileSize: size,
        mimeType: mimetype,
        fileType: "code",
        isPublic: project.isPublic,
      });

      // Get file extension for language detection
      const extension = path.extname(originalname).toLowerCase();
      const languageMap = {
        ".js": "javascript",
        ".ts": "typescript",
        ".jsx": "javascript",
        ".jsx": "typescript",
        ".py": "python",
        ".java": "java",
        ".cpp": "cpp",
        ".c": "c",
        ".h": "c",
        ".css": "css",
        ".html": "html",
        ".xml": "xml",
        ".json": "json",
        ".md": "markdown",
        ".sql": "sql",
        ".php": "php",
        ".rb": "ruby",
        ".go": "go",
        ".rs": "rust",
        ".swift": "swift",
        ".kt": "kotlin",
        ".dart": "dart",
        ".vue": "vue",
        ".scss": "scss",
        ".sass": "sass",
        ".less": "less",
      };

      const language = languageMap[extension] || "text";

      // Create code snippet
      const codeSnippet = await require("../models").CodeSnippet.create({
        projectId,
        title: originalname,
        content,
        language,
        filePath: originalname,
      });

      uploadedFiles.push({
        fileId: fileRecord.id,
        codeSnippetId: codeSnippet.id,
        originalName: originalname,
        language,
        size,
      });
    }

    res.json({
      message: "Code files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload code files error:", error);
    // Clean up files if upload failed
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError);
        }
      }
    }
    res.status(500).json({ message: "Server error" });
  }
};

const uploadProjectAssets = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Verify project access
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const hasAccess =
      project.userId === req.user.id ||
      (await ProjectCollaborator.findOne({
        where: {
          projectId,
          userId: req.user.id,
          role: { [Op.in]: ["admin", "editor"] },
        },
      }));

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const { filename, originalname, size, mimetype, path: filePath } = file;

      // Create file record
      const fileRecord = await File.create({
        userId: req.user.id,
        projectId,
        originalName: originalname,
        fileName: filename,
        filePath,
        fileSize: size,
        mimeType: mimetype,
        fileType: "asset",
        isPublic: project.isPublic,
      });

      uploadedFiles.push({
        id: fileRecord.id,
        originalName: originalname,
        url: `/api/files/${fileRecord.id}`,
        size,
        mimeType: mimetype,
      });
    }

    res.json({
      message: "Project assets uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload project assets error:", error);
    // Clean up files if upload failed
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError);
        }
      }
    }
    res.status(500).json({ message: "Server error" });
  }
};

const getFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id, {
      include: [
        {
          model: Project,
          as: "project",
        },
      ],
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check access permissions
    if (!file.isPublic) {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      let hasAccess = file.userId === req.user.id;

      if (file.projectId && !hasAccess) {
        hasAccess =
          file.project.userId === req.user.id ||
          (await ProjectCollaborator.findOne({
            where: {
              projectId: file.projectId,
              userId: req.user.id,
            },
          }));
      }

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Check if file exists
    try {
      await fs.access(file.filePath);
    } catch {
      return res.status(404).json({ message: "File not found on disk" });
    }

    // Increment download count
    await file.increment("downloadCount");

    // Set appropriate headers
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${file.originalName}"`);

    // Send file
    res.sendFile(path.resolve(file.filePath));
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id, {
      include: [
        {
          model: Project,
          as: "project",
        },
      ],
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check access permissions (same as getFile)
    if (!file.isPublic) {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      let hasAccess = file.userId === req.user.id;

      if (file.projectId && !hasAccess) {
        hasAccess =
          file.project.userId === req.user.id ||
          (await ProjectCollaborator.findOne({
            where: {
              projectId: file.projectId,
              userId: req.user.id,
            },
          }));
      }

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Check if file exists
    try {
      await fs.access(file.filePath);
    } catch {
      return res.status(404).json({ message: "File not found on disk" });
    }

    // Increment download count
    await file.increment("downloadCount");

    // Set headers for download
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);

    // Send file
    res.sendFile(path.resolve(file.filePath));
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type, page = 1, limit = 20 } = req.query;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check access permissions
    if (!project.isPublic) {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const hasAccess =
        project.userId === req.user.id ||
        (await ProjectCollaborator.findOne({
          where: {
            projectId,
            userId: req.user.id,
          },
        }));

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const whereClause = { projectId };
    if (type && ["code", "asset"].includes(type)) {
      whereClause.fileType = type;
    }

    const offset = (page - 1) * limit;

    const { count, rows: files } = await File.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "uploader",
          attributes: ["id", "username", "avatarUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const filesWithUrls = files.map((file) => ({
      ...file.toJSON(),
      url: `/api/files/${file.id}`,
      downloadUrl: `/api/files/${file.id}/download`,
    }));

    res.json({
      files: filesWithUrls,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get project files error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id, {
      include: [
        {
          model: Project,
          as: "project",
        },
      ],
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check permissions
    let canDelete = file.userId === req.user.id;

    if (file.projectId && !canDelete) {
      canDelete =
        file.project.userId === req.user.id ||
        (await ProjectCollaborator.findOne({
          where: {
            projectId: file.projectId,
            userId: req.user.id,
            role: { [Op.in]: ["admin", "editor"] },
          },
        }));
    }

    if (!canDelete) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete file from disk
    try {
      await fs.unlink(file.filePath);
    } catch (error) {
      console.error("Error deleting file from disk:", error);
    }

    // Delete file record
    await file.destroy();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadAvatar,
  uploadCodeFiles,
  uploadProjectAssets,
  getFile,
  downloadFile,
  getProjectFiles,
  deleteFile,
};