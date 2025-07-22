const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Like = sequelize.define(
    "Like",
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
      codeSnippetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "code_snippet_id",
      },
      likedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "liked_at",
      },
    },
    {
      tableName: "likes",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "code_snippet_id"],
        },
      ],
    }
  );

  Like.associate = (models) => {
    Like.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Like.belongsTo(models.CodeSnippet, {
      foreignKey: "codeSnippetId",
      as: "codeSnippet",
    });
  };

  return Like;
};
