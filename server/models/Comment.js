const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Comment = sequelize.define(
    "Comment",
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
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "project_id",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      lineNumber: {
        type: DataTypes.INTEGER,
        field: "line_number",
      },
    },
    {
      tableName: "comments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Comment.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
  };

  return Comment;
};