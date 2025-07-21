const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_public",
      },
      isCollaborative: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_collaborative",
      },
      starCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "star_count",
      },
      forkCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "fork_count",
      },
      forkedFrom: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "forked_from",
      },
      forkedFromSnippet: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "forked_from_snippet",
      },
    },
    {
      tableName: "projects",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.User, {
      foreignKey: "userId",
      as: "owner",
    });
    Project.hasMany(models.CodeSnippet, {
      foreignKey: "projectId",
      as: "codeSnippets",
    });
    Project.hasMany(models.ProjectCollaborator, {
      foreignKey: "projectId",
      as: "collaborators",
    });
    Project.hasMany(models.Star, {
      foreignKey: "projectId",
      as: "stars",
    });
    Project.belongsToMany(models.Tag, {
      through: models.ProjectTag,
      foreignKey: "projectId",
      as: "tags",
    });
    Project.hasMany(models.Comment, {
      foreignKey: "projectId",
      as: "comments",
    });
    Project.belongsTo(models.Project, {
      foreignKey: "forkedFrom",
      as: "originalProject",
    });
    Project.hasMany(models.Project, {
      foreignKey: "forkedFrom",
      as: "forks",
    });
    Project.belongsTo(models.CodeSnippet, {
      foreignKey: "forkedFromSnippet",
      as: "originalSnippet",
    });
    Project.hasMany(models.File, { 
    foreignKey: "projectId",
    as: "files",
  });
  };

  return Project;
};