const express = require("express");
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateCurrentUser,
  updateTouristPreferences,
  deleteCurrentUser,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getCurrentUser);
router.patch("/me", protect, updateCurrentUser);
router.patch("/me/preferences", protect, updateTouristPreferences);
router.delete("/me", protect, deleteCurrentUser);
router.post("/logout", protect, logout);

module.exports = router;
