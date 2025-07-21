const { sequelize } = require("../config/database");
const User = require("./User");
const Project = require("./Project");
const CodeSnippet = require("./CodeSnippet");
const ProjectCollaborator = require("./ProjectCollaborator");
const Star = require("./Star");
const Tag = require("./Tag");
const ProjectTag = require("./ProjectTag");
const Notification = require("./Notification");
const Comment = require("./Comment");
const UserStats = require("./UserStats");
const File = require("./File");
const SnippetTag = sequelize.define("SnippetTag", {}, { tableName: "snippet_tags", timestamps: false });

// Initialize models
const models = {
  User: User(sequelize),
  Project: Project(sequelize),
  CodeSnippet: CodeSnippet(sequelize),
  ProjectCollaborator: ProjectCollaborator(sequelize),
  Star: Star(sequelize),
  Tag: Tag(sequelize),
  ProjectTag: ProjectTag(sequelize),
  Notification: Notification(sequelize),
  Comment: Comment(sequelize),
  UserStats: UserStats(sequelize),
  File: File(sequelize),
  SnippetTag,
};

// Define associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};