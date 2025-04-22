module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('user', 'moderator', 'admin'),
        defaultValue: 'user'
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      avatarUrl: {
        type: DataTypes.STRING
      },
      bio: {
        type: DataTypes.TEXT
      }
    });
  
    User.associate = (models) => {
      User.hasMany(models.Project, { as: 'projects' });
      User.hasMany(models.Snippet, { as: 'snippets' });
      User.belongsToMany(models.Snippet, { through: 'UserStars', as: 'starredSnippets' });
      User.belongsToMany(models.Project, { through: 'Collaborators', as: 'collaborations' });
    };
  
    return User;
  };