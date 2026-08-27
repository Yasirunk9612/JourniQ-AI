"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, LifeBuoy, MessageCircle, RefreshCcw, Send, ShieldQuestion, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ChatConversation, ChatMessage, chatApi, createChatSocket } from "@/lib/chatApi";

export default function ChatWorkspace({
  title = "Messages",
  description = "Real-time conversations stay saved in your JourniQ account.",
  supportOnly = false,
}: {
  title?: string;
  description?: string;
  supportOnly?: boolean;
}) {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const active = conversations.find((item) => item.id === activeId);
  const unreadTotal = conversations.reduce((sum, conversation) => sum + (conversation.participants.find((participant) => participant.user.id === user?._id)?.unreadCount || 0), 0);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await chatApi.listConversations(supportOnly ? { contextType: "support" } : undefined);
      setConversations(res.conversations);
      setActiveId((current) => current || res.conversations[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load conversations.");
    } finally {
      setLoading(false);
    }
  }, [supportOnly, token]);

  const loadMessages = useCallback(async (id: string) => {
    if (!id) {
      setMessages([]);
      return;
    }
    try {
      const res = await chatApi.getConversation(id);
      setMessages(res.messages);
      setConversations((prev) => prev.map((item) => (item.id === res.conversation.id ? res.conversation : item)));
      await chatApi.markRead(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open conversation.");
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void loadConversations(), 0);
    return () => window.clearTimeout(id);
  }, [loadConversations]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadMessages(activeId), 0);
    return () => window.clearTimeout(id);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (!token) return undefined;
    const socket = createChatSocket(token);
    socket.on("chat:message", (payload: { conversation: ChatConversation; message: ChatMessage | null }) => {
      setConversations((prev) => {
        const next = [payload.conversation, ...prev.filter((item) => item.id !== payload.conversation.id)];
        return supportOnly ? next.filter((item) => item.contextType === "support") : next;
      });
      if (payload.message && payload.conversation.id === activeId) {
        setMessages((prev) => prev.some((item) => item.id === payload.message?.id) ? prev : [...prev, payload.message as ChatMessage]);
        void chatApi.markRead(payload.conversation.id);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [activeId, supportOnly, token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const startSupport = async () => {
    setError("");
    try {
      const res = await chatApi.startConversation({ contextType: "support", initialMessage: "Hi, I need help with JourniQ AI." });
      setConversations((prev) => [res.conversation, ...prev.filter((item) => item.id !== res.conversation.id)]);
      setActiveId(res.conversation.id);
      setMessages(res.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start support chat.");
    }
  };

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeId || !body.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await chatApi.sendMessage(activeId, body);
      setMessages((prev) => prev.some((item) => item.id === res.message.id) ? prev : [...prev, res.message]);
      setConversations((prev) => [res.conversation, ...prev.filter((item) => item.id !== res.conversation.id)]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const counterpart = useMemo(() => {
    if (!active || !user) return "";
    const other = active.participants.find((participant) => participant.user.id !== user._id);
    return other?.user.name || active.title;
  }, [active, user]);

  if (!user) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 text-center shadow-[var(--shadow-soft)]">
        <MessageCircle className="mx-auto h-10 w-10 text-[var(--color-teal)]" />
        <h1 className="mt-4 text-2xl font-extrabold text-[var(--color-midnight)]">Login required</h1>
        <p className="mt-2 text-sm text-slate-600">Please login to use JourniQ real-time chat.</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-[var(--shadow-lift)]">
      <header className="relative overflow-hidden bg-[var(--color-midnight)] p-5 text-white md:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(217,164,65,0.28),transparent_30%),radial-gradient(circle_at_82%_0%,rgba(15,118,110,0.35),transparent_34%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-100">
              {supportOnly ? <LifeBuoy size={14} /> : <MessageCircle size={14} />} Live JourniQ chat
            </p>
            <h1 className="mt-4 text-4xl font-black leading-none md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{description}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:w-[360px]">
            <HeaderStat label="Threads" value={String(conversations.length)} />
            <HeaderStat label="Unread" value={String(unreadTotal)} />
            <HeaderStat label="Mode" value={supportOnly ? "Help" : "Travel"} />
          </div>
        </div>
      </header>

      <div className="grid min-h-[680px] lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-[rgba(12,59,53,0.1)] bg-[#f6faf8] p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal)]">Inbox</p>
              <p className="mt-1 text-sm text-slate-600">Select a thread to continue.</p>
            </div>
            <button onClick={() => void loadConversations()} className="grid size-10 place-items-center rounded-full border border-emerald-100 bg-white text-emerald-800" aria-label="Refresh messages">
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
          {supportOnly && user.role !== "admin" ? (
            <button onClick={() => void startSupport()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-teal)] px-4 py-3 text-sm font-extrabold text-white">
              <ShieldQuestion className="h-4 w-4" /> Start help chat
            </button>
          ) : null}
          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="mt-5 max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {loading ? <p className="rounded-2xl bg-white p-4 text-sm text-emerald-800">Loading conversations...</p> : null}
            {!loading && conversations.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-emerald-200 bg-white p-5">
                <Sparkles className="h-8 w-8 text-[var(--color-gold)]" />
                <p className="mt-3 text-sm font-bold text-[var(--color-midnight)]">No conversations yet</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Start from a hotel, experience, or the help chat button.</p>
              </div>
            ) : null}
            {conversations.map((conversation) => {
              const unread = conversation.participants.find((participant) => participant.user.id === user._id)?.unreadCount || 0;
              const activeRow = conversation.id === activeId;
              return (
                <button key={conversation.id} onClick={() => setActiveId(conversation.id)} className={`w-full rounded-[1.25rem] border p-4 text-left transition ${activeRow ? "border-emerald-700 bg-emerald-900 text-white shadow-sm" : "border-transparent bg-white text-[var(--color-midnight)] hover:border-emerald-100 hover:bg-emerald-50"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="line-clamp-1 text-sm font-black">{conversation.title}</p>
                    {unread ? <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-black text-emerald-950">{unread}</span> : null}
                  </div>
                  <p className={`mt-1 line-clamp-2 text-xs leading-5 ${activeRow ? "text-white/68" : "text-slate-500"}`}>{conversation.lastMessage || conversation.contextType}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-[680px] flex-col">
          <header className="border-b border-[rgba(12,59,53,0.1)] bg-white/90 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-teal)]">{active?.contextType || "JourniQ chat"}</p>
            <h2 className="mt-1 flex items-center gap-2 text-2xl font-black text-[var(--color-midnight)]">
              {counterpart || "Select a conversation"} {active ? <ArrowUpRight size={18} className="text-[var(--color-gold)]" /> : null}
            </h2>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#fcfaf6,#eef3f1)] p-5">
            {!active ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <MessageCircle className="mx-auto h-12 w-12 text-[var(--color-teal)]" />
                  <p className="mt-3 text-sm font-bold text-slate-600">Choose a conversation to continue.</p>
                </div>
              </div>
            ) : null}
            {messages.map((message) => {
              const mine = message.sender.id === user._id;
              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-[1.35rem] px-4 py-3 shadow-sm ${mine ? "bg-[var(--color-teal)] text-white" : "bg-white text-slate-700"}`}>
                    <p className={`mb-1 text-[11px] font-black ${mine ? "text-white/65" : "text-[var(--color-teal)]"}`}>{mine ? "You" : message.sender.name}</p>
                    <p className="whitespace-pre-line text-sm leading-6">{message.body}</p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="border-t border-[rgba(12,59,53,0.1)] bg-white p-4">
            <div className="flex gap-3">
              <textarea value={body} onChange={(event) => setBody(event.target.value)} disabled={!active} rows={2} className="min-h-12 flex-1 resize-none rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 text-sm outline-none focus:border-[var(--color-gold)] focus:bg-white focus:ring-4 focus:ring-[rgba(217,164,65,0.16)]" placeholder={active ? "Write a clear message..." : "Select a conversation first"} />
              <button disabled={!active || sending || !body.trim()} className="inline-flex min-w-12 items-center justify-center rounded-2xl bg-[var(--color-coral)] px-4 text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <p className="text-xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{label}</p>
    </div>
  );
}
