module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define("Tag", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    });
  
    Tag.associate = (models) => {
      Tag.belongsToMany(models.Snippet, { through: 'SnippetTags', as: 'snippets' });
    };
  
    return Tag;
  };
// This model defines a Tag with fields for id and name, and establishes a many-to-many relationship with the Snippet model through the SnippetTags join table.  