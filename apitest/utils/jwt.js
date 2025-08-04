const jwt = require("jsonwebtoken");

const genAccess = (user) =>
  jwt.sign({ userId: user.id, username: user.username, role: user.role, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m"
  });

const genRefresh = (user) =>
  jwt.sign({ userId: user.id, username: user.username, role: user.role, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d"
  });

const verify = (t) => jwt.verify(t, process.env.JWT_SECRET);

module.exports = { genAccess, genRefresh, verify };
