"use client";

import ChatWorkspace from "@/components/chat/ChatWorkspace";
import { Badge } from "@/components/public/TouristUI";
import { LifeBuoy, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

export default function HelpPage() {
  return (
    <main className="bg-[var(--color-ivory)] pb-16 pt-28">
      <section className="tourist-container">
        <div className="journiq-dark-panel mb-8 rounded-[2rem] p-6 text-white md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-100">JourniQ support</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">Get help from the platform team</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">Ask about bookings, account access, provider approval, AI recommendations, or anything that needs admin support.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Real messages", icon: MessageCircle },
                { label: "Admin support", icon: ShieldCheck },
                { label: "Travel help", icon: LifeBuoy },
              ].map((item) => {
                const Icon = item.icon;
                return <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-4"><Icon className="text-[var(--color-gold)]" /><p className="mt-3 text-sm font-extrabold">{item.label}</p></div>;
              })}
            </div>
          </div>
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge tone="teal">Bookings</Badge>
          <Badge tone="gold">Account access</Badge>
          <Badge tone="coral">AI recommendations</Badge>
          <Badge tone="dark">Provider approval</Badge>
        </div>
        <ChatWorkspace
          title="JourniQ Help"
          description="Ask the JourniQ admin team about bookings, accounts, provider approval, or trip planning."
          supportOnly
        />
        <div className="mt-8 rounded-[1.75rem] bg-[var(--color-sand)] p-6 shadow-[var(--shadow-soft)]">
          <Sparkles className="text-[var(--color-coral)]" />
          <h2 className="mt-5 text-3xl leading-none text-[var(--color-midnight)]">Help is now part of the traveller journey.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Tourists can use AI for quick travel guidance, then move to this support chat when a real person or admin action is needed.</p>
        </div>
      </section>
    </main>
  );
}
