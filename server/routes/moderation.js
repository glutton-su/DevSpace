const express = require("express");
const {
  suspendUser,
  unsuspendUser,
  deleteUser,
  deleteProjectModeration,
  listReports,
  getAllUsers,
} = require("../controllers/moderationController.js");
const { auth, requireRole } = require("../middleware/auth.js");

const router = express.Router();
// Only admins can access moderation routes
router.use(auth, requireRole(["admin"]));

router.get("/users", getAllUsers);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/unsuspend", unsuspendUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", require("../controllers/moderationController").updateUserRole);
router.delete("/projects/:id", deleteProjectModeration);
router.get("/reports", listReports);

module.exports = router;
