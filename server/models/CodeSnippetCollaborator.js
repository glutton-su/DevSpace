const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CodeSnippetCollaborator = sequelize.define(
    "CodeSnippetCollaborator",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codeSnippetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "code_snippet_id",
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
      addedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "added_by",
      },
      permissions: {
        type: DataTypes.JSON,
        defaultValue: {
          canEdit: false,
          canDelete: false,
          canShare: false,
          canAddCollaborators: false
        }
      }
    },
    {
      tableName: "code_snippet_collaborators",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["code_snippet_id", "user_id"],
        },
      ],
    }
  );

  CodeSnippetCollaborator.associate = (models) => {
    CodeSnippetCollaborator.belongsTo(models.CodeSnippet, {
      foreignKey: "codeSnippetId",
      as: "codeSnippet",
    });
    CodeSnippetCollaborator.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    CodeSnippetCollaborator.belongsTo(models.User, {
      foreignKey: "addedBy",
      as: "inviter",
    });
  };

  return CodeSnippetCollaborator;
};
