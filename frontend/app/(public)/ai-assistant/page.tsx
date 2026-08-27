"use client";

import JourniqAiAssistant from "@/components/public/JourniqAiAssistant";
import { Badge } from "@/components/public/TouristUI";
import { Bot, Compass, Database, Sparkles } from "lucide-react";

export default function AiAssistantPage() {
  return (
    <main className="bg-[var(--color-ivory)] pb-16 pt-28">
      <section className="tourist-container">
        <div className="journiq-dark-panel relative mb-8 overflow-hidden rounded-[2rem] p-6 text-white md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,164,65,0.34),transparent_30%),radial-gradient(circle_at_86%_0%,rgba(15,118,110,0.42),transparent_34%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-100">JourniQ AI assistant</p>
              <h1 className="mt-3 max-w-3xl text-5xl font-black leading-none md:text-7xl">Ask Sri Lanka travel questions using real JourniQ data.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">Find destinations, hotels, community experiences, trip ideas, and support handoff without fake results.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Live listings", icon: Database },
                { label: "Trip logic", icon: Compass },
                { label: "AI answers", icon: Bot },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <Icon className="text-[var(--color-gold)]" />
                    <p className="mt-3 text-sm font-extrabold">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge tone="teal">Destination lookup</Badge>
          <Badge tone="gold">Hotel discovery</Badge>
          <Badge tone="coral">Experience ideas</Badge>
          <Badge tone="dark">Support handoff</Badge>
        </div>
        <JourniqAiAssistant />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "Ask for a trip idea and it can route you into the planner.",
            "Ask for places, hotels, or activities and it uses JourniQ public data.",
            "When it cannot do something, it should hand off to real support paths.",
          ].map((text) => (
            <div key={text} className="journiq-hover-lift rounded-[1.5rem] bg-white/88 p-5 text-sm font-semibold leading-6 text-slate-600 shadow-[var(--shadow-soft)]">
              <Sparkles className="mb-4 text-[var(--color-teal)]" /> {text}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
