const express = require("express");
const {
  getPendingUsers,
  approveUser,
  blockUser,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/pending-users", protect, allowRoles("admin"), getPendingUsers);
router.patch("/users/:id/approve", protect, allowRoles("admin"), approveUser);
router.patch("/users/:id/block", protect, allowRoles("admin"), blockUser);

module.exports = router;
