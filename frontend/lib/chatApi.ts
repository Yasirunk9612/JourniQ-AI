import { io, Socket } from "socket.io-client";
import { axiosClient } from "./axiosClient";
import { API_BASE_URL } from "./constants";
import { UserRole } from "./types";

const unwrap = <T>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export interface ChatUserSummary {
  id: string;
  name: string;
  email?: string;
  role?: UserRole;
  profileImage?: string;
}

export interface ChatParticipant {
  user: ChatUserSummary;
  role: UserRole;
  unreadCount: number;
  lastReadAt?: string | null;
}

export interface ChatConversation {
  id: string;
  contextType: "hotel" | "experience" | "support";
  contextId?: string | null;
  title: string;
  status: "open" | "closed";
  lastMessage?: string;
  lastMessageAt?: string;
  participants: ChatParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: ChatUserSummary;
  body: string;
  messageType: "text" | "system";
  readBy: string[];
  createdAt: string;
}

export const chatApi = {
  listConversations: (params?: { contextType?: string }) =>
    unwrap<{ conversations: ChatConversation[] }>(axiosClient.get("/chat/conversations", { params })),
  startConversation: (payload: { contextType: "hotel" | "experience" | "support"; contextId?: string; initialMessage?: string }) =>
    unwrap<{ conversation: ChatConversation; messages: ChatMessage[] }>(axiosClient.post("/chat/conversations", payload)),
  getConversation: (id: string) =>
    unwrap<{ conversation: ChatConversation; messages: ChatMessage[] }>(axiosClient.get(`/chat/conversations/${id}`)),
  sendMessage: (id: string, body: string) =>
    unwrap<{ conversation: ChatConversation; message: ChatMessage }>(axiosClient.post(`/chat/conversations/${id}/messages`, { body })),
  markRead: (id: string) => unwrap<{ conversation: ChatConversation }>(axiosClient.patch(`/chat/conversations/${id}/read`)),
};

export const createChatSocket = (token: string): Socket => {
  const baseUrl = API_BASE_URL.replace(/\/api$/, "");
  return io(baseUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
};
