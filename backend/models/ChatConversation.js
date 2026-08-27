const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["tourist", "admin", "hotel_owner", "activity_provider"], required: true },
    unreadCount: { type: Number, default: 0 },
    lastReadAt: { type: Date, default: null },
  },
  { _id: false }
);

const chatConversationSchema = new mongoose.Schema(
  {
    participants: { type: [participantSchema], required: true },
    contextType: { type: String, enum: ["hotel", "experience", "support"], required: true, index: true },
    contextId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    lastMessage: { type: String, default: "", trim: true, maxlength: 300 },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

chatConversationSchema.index({ "participants.user": 1, lastMessageAt: -1 });
chatConversationSchema.index({ contextType: 1, contextId: 1, "participants.user": 1 });

module.exports = mongoose.model("ChatConversation", chatConversationSchema);
