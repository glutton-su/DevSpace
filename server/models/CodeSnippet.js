const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CodeSnippet = sequelize.define(
    "CodeSnippet",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "project_id",
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      content: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING(50),
      },
      filePath: {
        type: DataTypes.STRING(500),
        field: "file_path",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_public",
      },
      forkedFromSnippet: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "forked_from_snippet",
      },
      forkedFromProject: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "forked_from_project",
      },
      allowCollaboration: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "allow_collaboration",
      },
    },
    {
      tableName: "code_snippets",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  CodeSnippet.associate = (models) => {
    CodeSnippet.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
    CodeSnippet.belongsTo(models.CodeSnippet, {
      foreignKey: "forkedFromSnippet",
      as: "originalSnippet",
    });
    CodeSnippet.belongsTo(models.Project, {
      foreignKey: "forkedFromProject",
      as: "originalProject",
    });
    CodeSnippet.hasMany(models.CodeSnippet, {
      foreignKey: "forkedFromSnippet",
      as: "forks",
    });
    CodeSnippet.hasMany(models.Star, {
      foreignKey: "codeSnippetId",
      as: "stars",
    });
    CodeSnippet.hasMany(models.Like, {
      foreignKey: "codeSnippetId",
      as: "likes",
    });
    CodeSnippet.belongsToMany(models.Tag, {
      through: "SnippetTag",
      foreignKey: "codeSnippetId",
      as: "tags",
    });
    CodeSnippet.hasMany(models.CodeSnippetCollaborator, {
      foreignKey: "codeSnippetId",
      as: "collaborators",
    });
  };

  return CodeSnippet;
};