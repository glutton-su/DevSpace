const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Announcement = sequelize.define('Announcement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'success', 'error'),
      defaultValue: 'info',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    expiresAt: {
      type: DataTypes.DATE,
      field: 'expires_at',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'announcements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Announcement.associate = (models) => {
    Announcement.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
  };

  return Announcement;
};
