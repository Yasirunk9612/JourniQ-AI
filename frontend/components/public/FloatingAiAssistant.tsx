"use client";

import { useEffect, useState } from "react";
import { Bot, X } from "lucide-react";
import JourniqAiAssistant from "./JourniqAiAssistant";

export default function FloatingAiAssistant() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 grid size-16 place-items-center rounded-full border border-white/40 bg-emerald-800 text-white shadow-[0_20px_50px_-24px_rgba(7,26,34,0.8)] transition hover:-translate-y-0.5 hover:bg-emerald-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"
        aria-label="Open JourniQ AI assistant"
      >
        <span className="absolute inset-0 rounded-full bg-amber-300/20 blur-md" aria-hidden="true" />
        <Bot className="relative" size={25} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[60] bg-black/45 p-3 sm:p-5">
          <div className="ml-auto flex h-full max-w-xl flex-col">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mb-3 ml-auto grid size-11 place-items-center rounded-full bg-white text-emerald-950 shadow-sm"
              aria-label="Close JourniQ AI assistant"
            >
              <X />
            </button>
            <JourniqAiAssistant compact />
          </div>
        </div>
      ) : null}
    </>
  );
}
