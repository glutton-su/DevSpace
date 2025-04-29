module.exports = (sequelize, DataTypes) => {
    const Snippet = sequelize.define("Snippet", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: 'plaintext'
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      expiresAt: {
        type: DataTypes.DATE
      },
      forkedFromId: {
        type: DataTypes.INTEGER
      }
    });
  
    Snippet.associate = (models) => {
      Snippet.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
      Snippet.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
      Snippet.belongsToMany(models.User, { through: 'UserStars', as: 'starredBy' });
      Snippet.belongsToMany(models.Tag, { through: 'SnippetTags', as: 'tags' });
      Snippet.hasMany(models.Comment, { as: 'comments' });
      Snippet.belongsTo(models.Snippet, { foreignKey: 'forkedFromId', as: 'forkedFrom' });
      Snippet.hasMany(models.Snippet, { foreignKey: 'forkedFromId', as: 'forks' });
    };
  
    return Snippet;
  };
// This model defines a Snippet with fields for title, content, language, visibility, expiration date, and a reference to the original snippet if it's a fork.