const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/chatController");

const router = express.Router();

router.use(protect);

router.get("/conversations", controller.listConversations);
router.post("/conversations", controller.startConversation);
router.get("/conversations/:id", controller.getConversation);
router.post("/conversations/:id/messages", controller.sendMessage);
router.patch("/conversations/:id/read", controller.markRead);

module.exports = router;
