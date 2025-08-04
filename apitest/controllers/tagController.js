const { Tag } = require("../models");

// Get all tags, ordered alphabetically
exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.findAll({
      order: [["name", "ASC"]],
    });
    res.json(tags);
  } catch (err) {
    next(err);
  }
};