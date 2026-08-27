"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DestinationCard from "@/components/public/DestinationCard";
import HeroSection from "@/components/public/HeroSection";
import SectionHeader from "@/components/public/SectionHeader";
import { Badge, ButtonLink, EmptyState, ErrorState, Field, LoadingSkeleton, SelectField } from "@/components/public/TouristUI";
import { destinations } from "@/lib/public-data";
import { publicApi } from "@/lib/publicApi";
import { Destination } from "@/lib/public-types";
import { ArrowRight, Compass, MapPinned, Mountain, Sparkles, SunMedium } from "lucide-react";

const categories = ["All", "Beaches", "Heritage", "Wildlife", "Mountains", "Cultural villages", "Adventure"];
const regions = ["All", "Southern Province", "Central Province", "Uva Province", "Sabaragamuwa Province"];

export default function DestinationsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All");
  const [sort, setSort] = useState("popular");
  const [remoteDestinations, setRemoteDestinations] = useState<Destination[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await publicApi.getDestinations({
        category: category === "All" ? undefined : category,
        region: region === "All" ? undefined : region,
        search: query || undefined,
      });
      setRemoteDestinations(res.destinations);
      setPersonalized(res.personalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load destinations.");
      setRemoteDestinations([]);
    } finally {
      setLoading(false);
    }
  }, [category, query, region]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(id);
  }, [load]);

  const visible = useMemo(() => {
    if (remoteDestinations.length > 0) {
      return [...remoteDestinations].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : (b.matchScore || b.rating) - (a.matchScore || a.rating));
    }
    const q = query.toLowerCase();
    const rows = destinations.filter((item) => {
      const matchesQuery = !q || [item.name, item.district, item.description, item.category].join(" ").toLowerCase().includes(q);
      const matchesCategory = category === "All" || item.category === category;
      const matchesRegion = region === "All" || item.province === region;
      return matchesQuery && matchesCategory && matchesRegion;
    });
    return [...rows].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : b.rating - a.rating);
  }, [category, query, region, remoteDestinations, sort]);

  return (
    <main>
      <HeroSection compact title="Explore Sri Lanka by mood, region, and season." subtitle="A visual island guide for beaches, heritage, wildlife, mountains, village culture, and adventure, ranked with your tourist preferences when available." image="https://images.unsplash.com/photo-1586896420943-d3a2bfdcc269?auto=format&fit=crop&w=1800&q=85" eyebrow="Destination discovery">
        <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
          {[
            { label: "Preference ranked", icon: Sparkles },
            { label: "Admin stories", icon: MapPinned },
            { label: "Season aware", icon: SunMedium },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm font-extrabold backdrop-blur">
                <Icon className="mb-2 text-[var(--color-gold)]" size={18} /> {item.label}
              </div>
            );
          })}
        </div>
      </HeroSection>

      <section className="tourist-container -mt-10 relative z-10">
        <div className="journiq-panel rounded-[1.75rem] p-4">
          <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr]">
            <Field label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sigiriya, beach, safari..." />
            <SelectField label="Region" value={region} onChange={(e) => setRegion(e.target.value)}>
              {regions.map((item) => <option key={item}>{item}</option>)}
            </SelectField>
            <SelectField label="Interest" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </SelectField>
            <SelectField label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Popular</option>
              <option value="name">A-Z</option>
            </SelectField>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto border-t border-[rgba(12,59,53,0.1)] pt-4">
            {categories.map((item) => <button key={item} onClick={() => setCategory(item)}><Badge tone={category === item ? "teal" : "dark"}>{item}</Badge></button>)}
          </div>
        </div>
      </section>

      <section className="tourist-container mt-12">
        <div className="journiq-map-grid grid gap-5 rounded-[2rem] bg-[var(--color-sand)]/70 p-5 shadow-[var(--shadow-soft)] lg:grid-cols-[0.95fr_1.05fr] lg:p-7">
          <div className="rounded-[1.5rem] bg-[var(--color-midnight)] p-6 text-white">
            <Compass className="text-[var(--color-gold)]" />
            <h2 className="mt-6 text-4xl leading-none">Choose the island by feeling, not only by location.</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">Filters are intentionally simple for tourists: region, interest, search, and sort. The destination story page carries the deeper blog content.</p>
            <ButtonLink href="/ai-trip-planner" variant="coral" className="mt-6">Build a route <ArrowRight size={16} /></ButtonLink>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {regions.filter((item) => item !== "All").map((item) => (
              <button key={item} onClick={() => setRegion(item)} className={`journiq-hover-lift rounded-[1.4rem] border p-5 text-left ${region === item ? "border-[var(--color-teal)] bg-white" : "border-white/70 bg-white/72"}`}>
                <Mountain className="text-[var(--color-teal)]" />
                <h3 className="mt-5 text-2xl leading-none text-[var(--color-midnight)]">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Tap to focus this region and refresh the live destination ranking.</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="tourist-container mt-10">
        <div className="journiq-marquee overflow-hidden rounded-[1.5rem] border border-[rgba(12,59,53,0.1)] bg-white/78 py-3 shadow-sm">
          <div className="journiq-marquee-track flex gap-3 px-3">
            {[...visible.slice(0, 8), ...visible.slice(0, 8)].map((item, index) => (
              <div key={`${item.slug || item.name}-${index}`} className="flex min-w-64 items-center justify-between rounded-full bg-[var(--color-muted)] px-4 py-3">
                <span>
                  <span className="block max-w-40 truncate text-sm font-extrabold text-[var(--color-midnight)]">{item.name}</span>
                  <span className="block text-xs font-bold text-[var(--color-teal)]">{item.district} · {item.category}</span>
                </span>
                <span className="journiq-live-dot text-xs font-extrabold text-emerald-700">{personalized ? "Match" : "Live"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tourist-container mt-14">
        <SectionHeader eyebrow={personalized ? "Recommended for you" : "Sri Lanka destinations"} title="Destination stories shaped by your travel taste." description={`${visible.length} destination${visible.length === 1 ? "" : "s"} shown. Admin-added destinations appear first and are ranked against logged-in tourist preferences.`} />
        {loading ? <LoadingSkeleton count={6} /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {!loading && !error ? visible.map((item, index) => <DestinationCard key={item.slug || item.name} item={item} variant={index === 0 ? "featured" : "default"} />) : null}
        </div>
        {!loading && !error && visible.length === 0 ? <div className="mt-8"><EmptyState title="No destinations match those filters" description="Try a broader search term, another region, or all interests." /></div> : null}
      </section>
    </main>
  );
}
