const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Star = sequelize.define(
    "Star",
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
      starredAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "starred_at",
      },
    },
    {
      tableName: "stars",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "project_id"],
        },
      ],
    }
  );

  Star.associate = (models) => {
    Star.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Star.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
  };

  return Star;
};