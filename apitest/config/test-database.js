const { Sequelize } = require("sequelize");

// Use MySQL for testing
const testSequelize = new Sequelize(
  "devspace_test", // Use the test database name with underscore
  "root", // Use root user
  "pranay", // Use the correct password
  {
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false, // Disable logging for tests
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    retry: {
      max: 3,
      timeout: 5000
    },
    // Add these options to prevent hanging connections
    dialectOptions: {
      connectTimeout: 60000,
      // Force close connections after use
      multipleStatements: false,
      // Prevent connection leaks
      supportBigNumbers: true,
      bigNumberStrings: true
    }
  }
);

// Initialize models with test database
const User = require("../models/User")(testSequelize);
const Project = require("../models/Project")(testSequelize);
const CodeSnippet = require("../models/CodeSnippet")(testSequelize);
const ProjectCollaborator = require("../models/ProjectCollaborator")(testSequelize);
const CodeSnippetCollaborator = require("../models/CodeSnippetCollaborator")(testSequelize);
const Star = require("../models/Star")(testSequelize);
const Like = require("../models/Like")(testSequelize);
const Tag = require("../models/Tag")(testSequelize);
const ProjectTag = require("../models/ProjectTag")(testSequelize);
const Notification = require("../models/Notification")(testSequelize);
const Comment = require("../models/Comment")(testSequelize);
const UserStats = require("../models/UserStats")(testSequelize);
const File = require("../models/File")(testSequelize);
const SnippetTag = testSequelize.define("SnippetTag", {}, { tableName: "snippet_tags", timestamps: false });

// Define associations
const models = {
  User,
  Project,
  CodeSnippet,
  ProjectCollaborator,
  CodeSnippetCollaborator,
  Star,
  Like,
  Tag,
  ProjectTag,
  Notification,
  Comment,
  UserStats,
  File,
  SnippetTag,
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

let isConnected = false;

const connectTestDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await testSequelize.authenticate();
    console.log("Connected to MySQL test database");
    isConnected = true;
    
    // Try to sync all models for testing, but don't fail if it doesn't work
    try {
      await testSequelize.sync({ force: true });
      console.log("Test database synced");
    } catch (syncError) {
      // Don't log sync errors during tests to avoid "Cannot log after tests are done"
      if (!process.env.NODE_ENV === 'test') {
        console.log("Database sync failed, using existing schema:", syncError.message);
      }
    }
  } catch (error) {
    console.error("Test database connection failed:", error);
    throw error;
  }
};

const closeTestDatabase = async () => {
  if (!isConnected) {
    return;
  }

  try {
    // Close all connections in the pool
    await testSequelize.close();
    console.log("Test database connection closed");
    isConnected = false;
  } catch (error) {
    console.error("Error closing test database:", error);
    isConnected = false;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closeTestDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeTestDatabase();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await closeTestDatabase();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await closeTestDatabase();
  process.exit(1);
});

// Handle Jest teardown specifically
process.on('beforeExit', async () => {
  await closeTestDatabase();
});

module.exports = {
  testSequelize,
  connectTestDatabase,
  closeTestDatabase,
  models,
}; 