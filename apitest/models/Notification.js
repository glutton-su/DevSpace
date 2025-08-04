const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
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
      type: {
        type: DataTypes.ENUM(
          "star",
          "fork",
          "collaboration_invite",
          "comment",
          "edit"
        ),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
      },
      relatedId: {
        type: DataTypes.INTEGER,
        field: "related_id",
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_read",
      },
    },
    {
      tableName: "notifications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Notification;
};