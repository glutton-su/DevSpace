const express = require("express");
const {
  suspendUser,
  unsuspendUser,
  deleteProjectModeration,
  listReports,
} = require("../controllers/moderationController.js");
const { auth, requireRole } = require("../middleware/auth.js");

const router = express.Router();
router.use(auth, requireRole(["moderator", "admin"]));

router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/unsuspend", unsuspendUser);
router.put("/users/:id/role", require("../controllers/moderationController").updateUserRole);
router.delete("/projects/:id", deleteProjectModeration);
router.get("/reports", listReports);

module.exports = router;
