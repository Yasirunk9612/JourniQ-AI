"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CTASection from "@/components/public/CTASection";
import ExperienceCard from "@/components/public/ExperienceCard";
import HeroSection from "@/components/public/HeroSection";
import SectionHeader from "@/components/public/SectionHeader";
import { Badge, Button, EmptyState, ErrorState, Field, LoadingSkeleton, SelectField } from "@/components/public/TouristUI";
import { publicApi } from "@/lib/publicApi";
import { Experience } from "@/lib/public-types";
import { useAuth } from "@/context/AuthContext";
import { Bike, Flame, HeartHandshake, Mountain, ShieldCheck, Waves } from "lucide-react";
import { formatLkr } from "@/lib/currency";

const categories = ["", "Village culture", "Traditional food", "Surfing", "Hiking", "Safari", "Wellness", "Cycling", "Camping"];

export default function ExperiencesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("recommended");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (params?: { district?: string; category?: string }) => {
    setLoading(true);
    setError("");
    try {
      const data = await publicApi.getExperiences(params);
      setExperiences(data.experiences || []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load experiences";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const priceCap = Number(maxPrice || 0);
    const rows = experiences.filter((item) => !priceCap || (item.price || 0) <= priceCap);
    return [...rows].sort((a, b) => {
      if (sort === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sort === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      return (b.bookingsCount || 0) - (a.bookingsCount || 0);
    });
  }, [experiences, maxPrice, sort]);

  const onBook = async (payload: { experienceId: string; date: string; guests: number }) => {
    if (user?.role !== "tourist") {
      toast.error("Please login as a tourist to book.");
      router.push("/login");
      return;
    }
    try {
      setBookingLoading(true);
      await publicApi.bookExperience(payload);
      toast.success("Experience booking request sent");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Booking failed";
      toast.error(message.includes("Access denied") || message.includes("Not authorized") ? "Please login as a tourist to book." : message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <main>
      <HeroSection compact title="Book experiences with local pulse." subtitle="Culture, food, surf, hiking, safaris, wellness, and community-led activities from approved providers." image="https://images.unsplash.com/photo-1575994532957-773da2f5a3e8?auto=format&fit=crop&w=1800&q=85" eyebrow="Community experiences">
        <div className="grid max-w-4xl gap-3 sm:grid-cols-4">
          {[
            { label: "Culture", icon: HeartHandshake },
            { label: "Surf", icon: Waves },
            { label: "Hiking", icon: Mountain },
            { label: "Adventure", icon: Flame },
          ].map((item) => {
            const Icon = item.icon;
            return <div key={item.label} className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm font-extrabold backdrop-blur"><Icon className="mb-2 text-[var(--color-gold)]" size={18} /> {item.label}</div>;
          })}
        </div>
      </HeroSection>

      <section className="tourist-container -mt-10 relative z-10">
        <div className="journiq-panel rounded-[1.75rem] p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_auto]">
            <Field label="Location" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" />
            <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((item) => <option key={item} value={item}>{item || "All categories"}</option>)}
            </SelectField>
            <Field label="Max price" type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Optional" />
            <Button onClick={() => load({ district: district || undefined, category: category || undefined })} variant="coral" className="self-end">Search experiences</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[rgba(12,59,53,0.1)] pt-4">
            {categories.filter(Boolean).map((item) => <button key={item} onClick={() => setCategory(item)}><Badge tone={category === item ? "coral" : "dark"}>{item}</Badge></button>)}
            <SelectField label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className="ml-auto max-w-64">
              <option value="recommended">Recommended</option>
              <option value="rating">Rating</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
            </SelectField>
          </div>
        </div>
      </section>

      <section className="tourist-container mt-12">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="journiq-orbit rounded-[2rem] bg-[var(--color-sand)] p-6 shadow-[var(--shadow-soft)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Live experiences", experiences.length],
                ["Visible matches", visible.length],
                ["Category filter", category || "All"],
                ["Price cap", maxPrice ? formatLkr(Number(maxPrice)) : "Any"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.35rem] bg-white/80 p-5">
                  <p className="text-3xl font-extrabold leading-none text-[var(--color-midnight)]">{value}</p>
                  <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <article className="journiq-dark-panel rounded-[2rem] p-7 text-white">
            <Bike className="text-[var(--color-gold)]" />
            <h2 className="mt-8 text-4xl leading-none">Designed for movement, people, and place.</h2>
            <p className="mt-4 text-sm leading-6 text-white/68">Experience cards keep provider identity, group size, duration, and booking action visible so tourists can decide quickly.</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold"><ShieldCheck size={16} /> Approved provider flow</p>
          </article>
        </div>
      </section>

      <section className="tourist-container mt-10">
        <div className="journiq-marquee overflow-hidden rounded-[1.5rem] border border-[rgba(12,59,53,0.1)] bg-white/78 py-3 shadow-sm">
          <div className="journiq-marquee-track flex gap-3 px-3">
            {[...visible.slice(0, 8), ...visible.slice(0, 8)].map((item, index) => (
              <div key={`${item.id || item.name}-${index}`} className="flex min-w-64 items-center justify-between rounded-full bg-[var(--color-muted)] px-4 py-3">
                <span>
                  <span className="block max-w-40 truncate text-sm font-extrabold text-[var(--color-midnight)]">{item.name}</span>
                  <span className="block text-xs font-bold text-[var(--color-coral)]">{item.district} · {String(item.category).replace("_", " ")}</span>
                </span>
                <span className="journiq-live-dot text-xs font-extrabold text-emerald-700">Live</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tourist-container mt-14">
        <SectionHeader eyebrow="Live provider listings" title="Creative Sri Lankan experiences, not generic tours." description={`${visible.length} experience listing${visible.length === 1 ? "" : "s"} matching your current filters.`} />
        <div className="mt-8">
          {loading ? <LoadingSkeleton count={6} /> : null}
          {!loading && error ? <ErrorState message={error} onRetry={() => load()} /> : null}
          {!loading && !error && visible.length === 0 ? <EmptyState title="No approved experiences found" description="Try another district or category. Experience results come from the live provider API." actionLabel="Reload experiences" onAction={() => load()} /> : null}
          {!loading && !error && visible.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => <ExperienceCard key={item.id || item.name} item={item} onBook={onBook} bookingLoading={bookingLoading} requiresLogin={user?.role !== "tourist"} />)}
            </div>
          ) : null}
        </div>
      </section>

      <div className="tourist-container mt-20">
        <CTASection title="Travel deeper through people, food, craft, and landscape." description="Book a community-led experience or use the AI planner to place activities into a balanced itinerary." buttonText="Plan experiences with AI" />
      </div>
    </main>
  );
}
