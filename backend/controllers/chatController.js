const asyncHandler = require("../utils/asyncHandler");
const {
  ChatConversation,
  ChatMessage,
  canAccessConversation,
  conversationResponse,
  createMessage,
  getOrCreateListingConversation,
  getOrCreateSupportConversation,
  messageResponse,
  participantSelect,
} = require("../services/chatService");

const emitChatUpdate = (req, conversation, message) => {
  const io = req.app.get("io");
  if (!io || !conversation) return;
  const payload = {
    conversation: conversationResponse(conversation),
    message: message ? messageResponse(message) : null,
  };
  conversation.participants.forEach((participant) => {
    const userId = String(participant.user?._id || participant.user);
    io.to(`user:${userId}`).emit("chat:message", payload);
  });
};

const listConversations = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { "participants.user": req.user._id };
  if (req.query.contextType) query.contextType = req.query.contextType;
  const conversations = await ChatConversation.find(query)
    .populate("participants.user", participantSelect)
    .sort({ lastMessageAt: -1 })
    .limit(80);
  res.json({ conversations: conversations.map(conversationResponse) });
});

const startConversation = asyncHandler(async (req, res) => {
  const { contextType, contextId, initialMessage } = req.body;
  let conversation;

  if (contextType === "support") {
    conversation = await getOrCreateSupportConversation({ user: req.user, initialMessage });
  } else {
    conversation = await getOrCreateListingConversation({
      tourist: req.user,
      contextType,
      contextId,
      initialMessage,
    });
  }

  const messages = await ChatMessage.find({ conversation: conversation._id })
    .populate("sender", participantSelect)
    .sort({ createdAt: 1 })
    .limit(80);

  emitChatUpdate(req, conversation, messages[messages.length - 1]);
  res.status(201).json({ conversation: conversationResponse(conversation), messages: messages.map(messageResponse) });
});

const getConversation = asyncHandler(async (req, res) => {
  const conversation = await ChatConversation.findById(req.params.id).populate("participants.user", participantSelect);
  if (!conversation) return res.status(404).json({ message: "Conversation not found." });
  if (!canAccessConversation(conversation, req.user)) return res.status(403).json({ message: "You cannot access this conversation." });

  const messages = await ChatMessage.find({ conversation: conversation._id })
    .populate("sender", participantSelect)
    .sort({ createdAt: 1 })
    .limit(120);

  res.json({ conversation: conversationResponse(conversation), messages: messages.map(messageResponse) });
});

const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await ChatConversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ message: "Conversation not found." });
  if (!canAccessConversation(conversation, req.user)) return res.status(403).json({ message: "You cannot send messages in this conversation." });

  const message = await createMessage({ conversation, sender: req.user, body: req.body.body });
  const hydratedConversation = await ChatConversation.findById(conversation._id).populate("participants.user", participantSelect);
  emitChatUpdate(req, hydratedConversation, message);
  res.status(201).json({ conversation: conversationResponse(hydratedConversation), message: messageResponse(message) });
});

const markRead = asyncHandler(async (req, res) => {
  const conversation = await ChatConversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ message: "Conversation not found." });
  if (!canAccessConversation(conversation, req.user)) return res.status(403).json({ message: "You cannot access this conversation." });

  conversation.participants = conversation.participants.map((participant) => {
    if (String(participant.user) === String(req.user._id)) {
      participant.unreadCount = 0;
      participant.lastReadAt = new Date();
    }
    return participant;
  });
  await conversation.save();
  await ChatMessage.updateMany({ conversation: conversation._id, readBy: { $ne: req.user._id } }, { $addToSet: { readBy: req.user._id } });
  const hydratedConversation = await ChatConversation.findById(conversation._id).populate("participants.user", participantSelect);
  res.json({ conversation: conversationResponse(hydratedConversation) });
});

module.exports = {
  getConversation,
  listConversations,
  markRead,
  sendMessage,
  startConversation,
};
