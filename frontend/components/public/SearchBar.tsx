"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CalendarDays, MapPin, Search, SlidersHorizontal, Sparkles, Users } from "lucide-react";

const interests = ["Beaches", "Heritage", "Wildlife", "Food", "Adventure", "Wellness"];

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [interest, setInterest] = useState("Heritage");
  const [mobileOpen, setMobileOpen] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("district", destination);
    if (interest) params.set("interest", interest);
    router.push(`/destinations?${params.toString()}`);
  };

  const form = (
    <form onSubmit={submit} className={`grid gap-3 ${compact ? "md:grid-cols-[1.4fr_1fr_0.8fr_auto]" : "lg:grid-cols-[1.2fr_1fr_0.8fr_1fr_auto]"}`}>
      <label className="relative">
        <span className="sr-only">Destination</span>
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-teal)]" size={18} />
        <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where in Sri Lanka?" className="min-h-14 w-full rounded-2xl border border-white/60 bg-white/92 pl-11 pr-4 text-sm font-semibold text-[var(--color-midnight)] shadow-sm outline-none focus:ring-4 focus:ring-[rgba(217,164,65,0.22)]" />
      </label>
      <label className="relative">
        <span className="sr-only">Travel date</span>
        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-teal)]" size={18} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="min-h-14 w-full rounded-2xl border border-white/60 bg-white/92 pl-11 pr-4 text-sm font-semibold text-[var(--color-midnight)] shadow-sm outline-none focus:ring-4 focus:ring-[rgba(217,164,65,0.22)]" />
      </label>
      <label className="relative">
        <span className="sr-only">Travellers</span>
        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-teal)]" size={18} />
        <input type="number" min={1} value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} className="min-h-14 w-full rounded-2xl border border-white/60 bg-white/92 pl-11 pr-4 text-sm font-semibold text-[var(--color-midnight)] shadow-sm outline-none focus:ring-4 focus:ring-[rgba(217,164,65,0.22)]" />
      </label>
      {!compact ? (
        <label className="relative">
          <span className="sr-only">Interest</span>
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-teal)]" size={18} />
          <select value={interest} onChange={(e) => setInterest(e.target.value)} className="min-h-14 w-full rounded-2xl border border-white/60 bg-white/92 pl-11 pr-4 text-sm font-semibold text-[var(--color-midnight)] shadow-sm outline-none focus:ring-4 focus:ring-[rgba(217,164,65,0.22)]">
            {interests.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      ) : null}
      <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--color-coral)] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#e85f42]">
        <Search size={18} /> Search
      </button>
    </form>
  );

  return (
    <>
      <div className="hidden rounded-[1.5rem] border border-white/40 bg-white/18 p-3 shadow-[0_20px_70px_-42px_rgba(0,0,0,0.65)] backdrop-blur-xl md:block">
        {form}
      </div>
      <button onClick={() => setMobileOpen(true)} className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-white/50 bg-white/92 px-4 text-left text-sm font-extrabold text-[var(--color-midnight)] shadow-sm md:hidden">
        <span className="inline-flex items-center gap-2"><Search size={18} /> Search your Sri Lanka trip</span>
        <SlidersHorizontal size={18} />
      </button>
      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/45 p-3 md:hidden" role="dialog" aria-modal="true">
          <div className="mt-20 rounded-[1.5rem] bg-[var(--color-ivory)] p-4 shadow-[var(--shadow-lift)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-extrabold text-[var(--color-midnight)]">Search journey</p>
              <button onClick={() => setMobileOpen(false)} className="rounded-full px-3 py-2 text-sm font-bold text-[var(--color-teal)]">Close</button>
            </div>
            {form}
          </div>
        </div>
      ) : null}
    </>
  );
}
