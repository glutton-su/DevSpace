const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProjectCollaborator = sequelize.define(
    "ProjectCollaborator",
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      role: {
        type: DataTypes.ENUM("viewer", "editor", "admin"),
        defaultValue: "viewer",
      },
      addedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "added_at",
      },
    },
    {
      tableName: "project_collaborators",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["project_id", "user_id"],
        },
      ],
    }
  );

  ProjectCollaborator.associate = (models) => {
    ProjectCollaborator.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
    ProjectCollaborator.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return ProjectCollaborator;
};