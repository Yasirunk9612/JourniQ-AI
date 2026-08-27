"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { chatApi } from "@/lib/chatApi";

export default function ListingInquiryButton({
  contextType,
  contextId,
  listingName,
}: {
  contextType: "hotel" | "experience";
  contextId: string;
  listingName: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(`Hi, I would like to know more about ${listingName}.`);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!body.trim()) return;
    setLoading(true);
    try {
      await chatApi.startConversation({ contextType, contextId, initialMessage: body });
      toast.success("Inquiry sent. You can continue from Messages.");
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send inquiry.";
      toast.error(message.includes("Not authorized") ? "Please login as a tourist to send an inquiry." : message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Link href="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">
        <MessageCircle className="h-4 w-4" /> Login to message owner
      </Link>
    );
  }

  if (user.role !== "tourist") {
    return null;
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">
        <MessageCircle className="h-4 w-4" /> Chat with owner
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-4 sm:place-items-center">
          <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-[1.75rem] bg-white p-5 text-slate-700 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Real-time inquiry</p>
                <h2 className="mt-1 text-2xl font-semibold text-emerald-950">{listingName}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-emerald-100 p-2 text-emerald-800" aria-label="Close inquiry">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-5 block text-sm font-semibold text-emerald-950">
              Message
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} className="mt-2 w-full resize-none rounded-2xl border border-emerald-100 px-4 py-3 text-sm outline-none focus:border-emerald-700" />
            </label>
            <button type="button" onClick={() => void send()} disabled={loading || !body.trim()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              <Send className="h-4 w-4" /> {loading ? "Sending..." : "Send inquiry"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
