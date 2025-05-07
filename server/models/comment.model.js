module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define("Comment", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    });
  
    Comment.associate = (models) => {
      Comment.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
      Comment.belongsTo(models.Snippet, { foreignKey: 'snippetId', as: 'snippet' });
    };
  
    return Comment;
  };