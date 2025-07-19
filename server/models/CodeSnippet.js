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
  };

  return CodeSnippet;
};