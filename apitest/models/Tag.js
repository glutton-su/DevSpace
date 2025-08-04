const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Tag = sequelize.define(
    "Tag",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      color: {
        type: DataTypes.STRING(7),
        defaultValue: "#007bff",
        validate: {
          is: /^#[0-9A-F]{6}$/i,
        },
      },
    },
    {
      tableName: "tags",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Project, {
      through: models.ProjectTag,
      foreignKey: "tagId",
      as: "projects",
    });
    Tag.belongsToMany(models.CodeSnippet, {
      through: "SnippetTag",
      foreignKey: "tagId",
      as: "codeSnippets",
    });
  };

  return Tag;
};