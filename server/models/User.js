const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
          is: /^[a-zA-Z0-9_]+$/,
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
      },
      fullName: {
        type: DataTypes.STRING(100),
        field: "full_name",
      },
      bio: {
        type: DataTypes.TEXT,
      },
      avatarUrl: {
        type: DataTypes.STRING(255),
        field: "avatar_url",
        defaultValue: "/static/default-avatar-robot.png",
      },
      themePreference: {
        type: DataTypes.ENUM("light", "dark"),
        defaultValue: "light",
        field: "theme_preference",
      },
      role: {
        type: DataTypes.ENUM("user", "moderator", "admin"),
        defaultValue: "user",
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_verified",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeCreate: async (user) => {
          if (user.passwordHash) {
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("passwordHash")) {
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
          }
        },
      },
    }
  );

  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  User.associate = (models) => {
    User.hasMany(models.Project, {
      foreignKey: "userId",
      as: "projects",
    });
    User.hasMany(models.Star, {
      foreignKey: "userId",
      as: "stars",
    });
    User.hasMany(models.ProjectCollaborator, {
      foreignKey: "userId",
      as: "collaborations",
    });
    User.hasMany(models.Notification, {
      foreignKey: "userId",
      as: "notifications",
    });
    User.hasMany(models.Comment, {
      foreignKey: "userId",
      as: "comments",
    });
    User.hasOne(models.UserStats, {
      foreignKey: "userId",
      as: "stats",
    });
    User.hasMany(models.File, { 
    foreignKey: "userId",
    as: "files",
  });
  };

  return User;
};