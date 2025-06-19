const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const File = sequelize.define(
    "File",
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
        allowNull: true,
        field: "project_id",
      },
      originalName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "original_name",
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "file_name",
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: "file_path",
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "file_size",
      },
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "mime_type",
      },
      fileType: {
        type: DataTypes.ENUM("avatar", "code", "asset", "temp"),
        allowNull: false,
        field: "file_type",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_public",
      },
      downloadCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "download_count",
      },
    },
    {
      tableName: "files",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  File.associate = (models) => {
    File.belongsTo(models.User, {
      foreignKey: "userId",
      as: "uploader",
    });
    File.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
  };

  return File;
};