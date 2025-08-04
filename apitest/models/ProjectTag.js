const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProjectTag = sequelize.define(
    "ProjectTag",
    {
      projectId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "project_id",
      },
      tagId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "tag_id",
      },
    },
    {
      tableName: "project_tags",
      timestamps: false,
    }
  );

  return ProjectTag;
};