const jwt = require("jsonwebtoken");

const genAccess = (id) =>
  jwt.sign({ userId: id, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m"
  });

const genRefresh = (id) =>
  jwt.sign({ userId: id, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d"
  });

const verify = (t) => jwt.verify(t, process.env.JWT_SECRET);

module.exports = { genAccess, genRefresh, verify };
