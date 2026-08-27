const ChatConversation = require("../models/ChatConversation");
const ChatMessage = require("../models/ChatMessage");
const Hotel = require("../models/Hotel");
const Experience = require("../models/Experience");
const User = require("../models/User");

const participantSelect = "name email role profileImage businessName";

const isParticipant = (conversation, userId) =>
  conversation.participants.some((participant) => String(participant.user?._id || participant.user) === String(userId));

const isAdmin = (user) => user?.role === "admin";

const userSummary = (user) => ({
  id: String(user._id),
  name: user.businessName || user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage || "",
});

const conversationResponse = (conversation) => ({
  id: String(conversation._id),
  contextType: conversation.contextType,
  contextId: conversation.contextId ? String(conversation.contextId) : null,
  title: conversation.title,
  status: conversation.status,
  lastMessage: conversation.lastMessage,
  lastMessageAt: conversation.lastMessageAt,
  participants: conversation.participants.map((participant) => ({
    user: participant.user?._id ? userSummary(participant.user) : { id: String(participant.user), name: "User", role: participant.role },
    role: participant.role,
    unreadCount: participant.unreadCount || 0,
    lastReadAt: participant.lastReadAt,
  })),
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

const messageResponse = (message) => ({
  id: String(message._id),
  conversationId: String(message.conversation),
  sender: message.sender?._id ? userSummary(message.sender) : { id: String(message.sender), name: "User" },
  body: message.body,
  messageType: message.messageType,
  readBy: (message.readBy || []).map(String),
  createdAt: message.createdAt,
});

const findAdminUser = async () => {
  const admin = await User.findOne({ role: "admin", status: { $ne: "blocked" } }).sort({ createdAt: 1 });
  if (!admin) throw new Error("No admin support account is available.");
  return admin;
};

const getOrCreateListingConversation = async ({ tourist, contextType, contextId, initialMessage }) => {
  if (tourist.role !== "tourist") throw new Error("Only tourist accounts can start listing inquiries.");
  if (!["hotel", "experience"].includes(contextType)) throw new Error("Invalid inquiry type.");

  const listing =
    contextType === "hotel"
      ? await Hotel.findOne({ _id: contextId, verificationStatus: "approved" }).populate("owner", participantSelect)
      : await Experience.findOne({ _id: contextId, status: { $in: ["approved", "active"] } }).populate("owner", participantSelect);

  if (!listing) throw new Error("Listing not found or unavailable.");
  const owner = listing.owner;
  if (!owner) throw new Error("Listing owner is unavailable.");

  let conversation = await ChatConversation.findOne({
    contextType,
    contextId,
    "participants.user": { $all: [tourist._id, owner._id] },
  });

  if (!conversation) {
    conversation = await ChatConversation.create({
      contextType,
      contextId,
      title: contextType === "hotel" ? listing.hotelName : listing.title,
      participants: [
        { user: tourist._id, role: tourist.role, unreadCount: 0 },
        { user: owner._id, role: owner.role, unreadCount: 0 },
      ],
    });
  }

  if (initialMessage) {
    await createMessage({ conversation, sender: tourist, body: initialMessage });
  }

  return ChatConversation.findById(conversation._id).populate("participants.user", participantSelect);
};

const getOrCreateSupportConversation = async ({ user, initialMessage }) => {
  const admin = user.role === "admin" ? user : await findAdminUser();
  const participants = user.role === "admin" ? [user._id] : [user._id, admin._id];

  let conversation = await ChatConversation.findOne({
    contextType: "support",
    "participants.user": { $all: participants },
  });

  if (!conversation) {
    conversation = await ChatConversation.create({
      contextType: "support",
      title: user.role === "admin" ? "Admin support inbox" : `Help request from ${user.name}`,
      participants: participants.map((participantId) => ({
        user: participantId,
        role: String(participantId) === String(admin._id) ? "admin" : user.role,
        unreadCount: 0,
      })),
    });
  }

  if (initialMessage) {
    await createMessage({ conversation, sender: user, body: initialMessage });
  }

  return ChatConversation.findById(conversation._id).populate("participants.user", participantSelect);
};

const createMessage = async ({ conversation, sender, body }) => {
  if (!body || !String(body).trim()) throw new Error("Message cannot be empty.");
  if (!isParticipant(conversation, sender._id) && !isAdmin(sender)) throw new Error("You cannot send messages in this conversation.");

  const message = await ChatMessage.create({
    conversation: conversation._id,
    sender: sender._id,
    body: String(body).trim().slice(0, 2000),
    readBy: [sender._id],
  });

  conversation.lastMessage = message.body.slice(0, 300);
  conversation.lastMessageAt = message.createdAt;
  conversation.participants = conversation.participants.map((participant) => {
    if (String(participant.user) === String(sender._id)) {
      participant.lastReadAt = new Date();
      participant.unreadCount = 0;
    } else {
      participant.unreadCount = (participant.unreadCount || 0) + 1;
    }
    return participant;
  });
  await conversation.save();
  return ChatMessage.findById(message._id).populate("sender", participantSelect);
};

const canAccessConversation = (conversation, user) => isAdmin(user) || isParticipant(conversation, user._id);

module.exports = {
  ChatConversation,
  ChatMessage,
  canAccessConversation,
  conversationResponse,
  createMessage,
  getOrCreateListingConversation,
  getOrCreateSupportConversation,
  isParticipant,
  messageResponse,
  participantSelect,
};
