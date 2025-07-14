const express = require("express");
const tagController = require("../controllers/tagController");
const router = express.Router();

// Anyone can view the list of tags
router.get("/", tagController.getAllTags);

module.exports = router;