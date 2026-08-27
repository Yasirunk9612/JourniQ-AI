"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, Compass, ExternalLink, Loader2, Send, Sparkles, User } from "lucide-react";
import { publicApi } from "@/lib/publicApi";

type AssistantReply = Awaited<ReturnType<typeof publicApi.chatWithAiAssistant>>["reply"];
type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  reply?: AssistantReply;
};

const starters = [
  "Plan me 5 days in Sri Lanka with culture and beaches",
  "Find hotels in Galle",
  "Recommend village life experiences",
  "Where should I visit for hiking?",
];

export default function JourniqAiAssistant({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I am JourniQ AI. Ask me for Sri Lankan destinations, hotels, experiences, or a trip-planning direction.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;
    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", text: message };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await publicApi.chatWithAiAssistant({ message });
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: res.reply.answer,
          reply: res.reply,
        },
      ]);
    } catch (err) {
      setMessages((current) => [
        ...current,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: err instanceof Error ? err.message : "I could not answer that right now.",
        },
      ]);
    } finally {
      setLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send(input);
  };

  const heightClass = useMemo(() => (compact ? "h-[600px]" : "min-h-[760px]"), [compact]);

  return (
    <section className={`flex ${heightClass} flex-col overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-[var(--shadow-lift)]`}>
      <header className="relative overflow-hidden border-b border-emerald-100 bg-[var(--color-midnight)] p-5 text-white md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(217,164,65,0.32),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(15,118,110,0.38),transparent_34%)]" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-100">
            <Sparkles size={14} /> Data-aware assistant
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black leading-none md:text-4xl">JourniQ AI</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/68">Ask with real JourniQ hotels, experiences, destinations, preferences, and the trained recommendation engine.</p>
            </div>
            <div className="hidden size-16 place-items-center rounded-[1.5rem] border border-white/10 bg-white/10 text-amber-100 sm:grid">
              <Compass size={28} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#fcfaf6,#eef3f1)] p-4">
        {messages.map((message) => {
          const mine = message.role === "user";
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] rounded-[1.5rem] p-4 ${mine ? "bg-[var(--color-teal)] text-white" : "bg-white text-slate-700 shadow-sm"}`}>
                <p className={`mb-2 inline-flex items-center gap-2 text-xs font-bold ${mine ? "text-white/70" : "text-emerald-700"}`}>
                  {mine ? <User size={14} /> : <Bot size={14} />} {mine ? "You" : "JourniQ AI"}
                </p>
                <p className="whitespace-pre-line text-sm leading-6">{message.text}</p>
                {message.reply ? <ReplyDetails reply={message.reply} /> : null}
              </div>
            </div>
          );
        })}
        {loading ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking with JourniQ data...
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-emerald-100 bg-white p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {starters.map((starter) => (
            <button key={starter} type="button" onClick={() => void send(starter)} className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100">
              {starter}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-3">
          <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} className="min-h-12 flex-1 rounded-2xl border border-emerald-100 bg-emerald-50/45 px-4 text-sm outline-none focus:border-[var(--color-gold)] focus:bg-white focus:ring-4 focus:ring-[rgba(217,164,65,0.16)]" placeholder="Ask about hotels, destinations, experiences, or trip ideas..." />
          <button disabled={loading || !input.trim()} className="grid min-h-12 w-12 place-items-center rounded-2xl bg-[var(--color-coral)] text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send">
            <Send size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}

function ReplyDetails({ reply }: { reply: AssistantReply }) {
  return (
    <div className="mt-4 space-y-3">
      {reply.items?.length ? (
        <div className="grid gap-2">
          {reply.items.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-2xl border border-emerald-100 bg-emerald-50/55 p-3 transition hover:bg-emerald-50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-extrabold text-emerald-950">{item.title}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-700">{item.subtitle}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      ) : null}
      {reply.actions?.length ? (
        <div className="flex flex-wrap gap-2">
          {reply.actions.map((action) => (
            <Link key={`${action.href}-${action.label}`} href={action.href} className="rounded-full bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-900">
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
      {reply.model ? <p className="text-[11px] font-semibold text-slate-500">Model signal: {reply.model.selectedModel}. {reply.model.note}</p> : null}
    </div>
  );
}
