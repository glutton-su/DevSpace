module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define("Notification", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.ENUM('comment', 'star', 'fork', 'collaboration', 'mention'),
        allowNull: false
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      relatedItemId: {
        type: DataTypes.INTEGER
      },
      relatedItemType: {
        type: DataTypes.STRING
      }
    });
  
    Notification.associate = (models) => {
      Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };
  
    return Notification;
  };
  