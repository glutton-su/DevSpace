const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserStats = sequelize.define(
    "UserStats",
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "user_id",
      },
      totalProjects: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "total_projects",
      },
      totalStarsReceived: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "total_stars_received",
      },
      totalForksReceived: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "total_forks_received",
      },
      mostUsedLanguage: {
        type: DataTypes.STRING(50),
        field: "most_used_language",
      },
      lastCalculated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "last_calculated",
      },
    },
    {
      tableName: "user_stats",
      timestamps: false,
    }
  );

  UserStats.associate = (models) => {
    UserStats.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return UserStats;
};