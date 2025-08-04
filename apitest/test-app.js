const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

// Override environment to use test database
process.env.NODE_ENV = "test";
process.env.DB_NAME = "devspace_test";
process.env.DB_HOST = "127.0.0.1";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "pranay";

// Only initialize test database when explicitly needed
let testSequelize = null;
let models = null;

const initializeTestDatabase = () => {
  if (!testSequelize) {
    const { testSequelize: db, models: dbModels } = require("./config/test-database");
    testSequelize = db;
    models = dbModels;
  }
  return { testSequelize, models };
};

// Override the main models with test models only when needed
const originalModels = require("./models");

// Import routes after models are overridden
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/projects");
const codeRoutes = require("./routes/code");
const notificationRoutes = require("./routes/notification");
const fileRoutes = require("./routes/files");

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/files", fileRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
  if (testSequelize) {
    try {
      await testSequelize.close();
      console.log('Test app database connection closed');
    } catch (error) {
      console.error('Error closing test app database:', error);
    }
  }
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { app, initializeTestDatabase }; 