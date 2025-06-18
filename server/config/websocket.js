const jwt = require("jsonwebtoken");
const { User, Project, ProjectCollaborator } = require("../models");

const setupWebSocket = (io) => {
  // Authentication middleware for WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.userId, {
        attributes: ["id", "username"],
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join project room for collaborative editing
    socket.on("join-project", async (projectId) => {
      try {
        const project = await Project.findByPk(projectId);

        if (!project) {
          socket.emit("error", { message: "Project not found" });
          return;
        }

        // Check if user has access to project
        let hasAccess = project.isPublic || project.userId === socket.user.id;

        if (!hasAccess) {
          const collaboration = await ProjectCollaborator.findOne({
            where: {
              projectId,
              userId: socket.user.id,
            },
          });
          hasAccess = !!collaboration;
        }

        if (!hasAccess) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        socket.join(`project:${projectId}`);
        socket.emit("joined-project", { projectId });

        // Notify others in the room
        socket.to(`project:${projectId}`).emit("user-joined", {
          userId: socket.user.id,
          username: socket.user.username,
        });
      } catch (error) {
        console.error("Join project error:", error);
        socket.emit("error", { message: "Failed to join project" });
      }
    });

    // Handle code changes for collaborative editing
    socket.on("code-change", (data) => {
      socket.to(`project:${data.projectId}`).emit("code-change", {
        ...data,
        userId: socket.user.id,
        username: socket.user.username,
        timestamp: new Date(),
      });
    });

    // Handle cursor position changes
    socket.on("cursor-change", (data) => {
      socket.to(`project:${data.projectId}`).emit("cursor-change", {
        ...data,
        userId: socket.user.id,
        username: socket.user.username,
      });
    });

    // Handle user typing indicators
    socket.on("typing-start", (data) => {
      socket.to(`project:${data.projectId}`).emit("user-typing", {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: true,
      });
    });

    socket.on("typing-stop", (data) => {
      socket.to(`project:${data.projectId}`).emit("user-typing", {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${socket.user.username} disconnected`);
    });
  });
};

module.exports = {
  setupWebSocket,
};