module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define("Project", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    });
  
    Project.associate = (models) => {
      Project.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
      Project.hasMany(models.Snippet, { as: 'snippets' });
      Project.belongsToMany(models.User, { through: 'Collaborators', as: 'collaborators' });
    };
  
    return Project;
  };