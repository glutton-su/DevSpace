const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const { connectDatabase } = require("./config/database");
const { setupWebSocket } = require("./config/websocket");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/projects");
const codeRoutes = require("./routes/code");
const notificationRoutes = require("./routes/notifications");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Initialize database and WebSocket
const startServer = async () => {
  try {
    await connectDatabase();
    setupWebSocket(io);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();