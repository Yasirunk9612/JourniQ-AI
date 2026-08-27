"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BedDouble, Building2, Grid2X2, List, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import HeroSection from "@/components/public/HeroSection";
import HotelCard from "@/components/public/HotelCard";
import SectionHeader from "@/components/public/SectionHeader";
import { Button, EmptyState, ErrorState, Field, LoadingSkeleton, SelectField } from "@/components/public/TouristUI";
import { publicApi } from "@/lib/publicApi";
import { Hotel } from "@/lib/public-types";
import { useAuth } from "@/context/AuthContext";

type SortMode = "recommended" | "rating" | "price-asc" | "price-desc";

const parsePrice = (price: string) => Number(price.match(/\d+/)?.[0] || 0);

export default function HotelsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortMode>("recommended");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (params?: { district?: string; type?: string }) => {
    setLoading(true);
    setError("");
    try {
      const data = await publicApi.getHotels(params);
      setHotels(data.hotels || []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load hotels";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredHotels = useMemo(() => {
    const rows = hotels.filter((hotel) => hotel.rating >= minRating);
    return [...rows].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "price-asc") return parsePrice(a.price) - parsePrice(b.price);
      if (sort === "price-desc") return parsePrice(b.price) - parsePrice(a.price);
      return b.rating - a.rating;
    });
  }, [hotels, minRating, sort]);

  const onSearch = async () => {
    await load({ district: district || undefined, type: type || undefined });
    setShowFilters(false);
  };

  const onBook = async (payload: { hotelId: string; checkIn: string; checkOut: string; guests: number }) => {
    if (user?.role !== "tourist") {
      toast.error("Please login as a tourist to book.");
      router.push("/login");
      return;
    }
    try {
      setBookingLoading(true);
      await publicApi.bookHotel(payload);
      toast.success("Hotel booking request sent");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Booking failed";
      toast.error(message.includes("Access denied") || message.includes("Not authorized") ? "Please login as a tourist to book." : message);
    } finally {
      setBookingLoading(false);
    }
  };

  const controls = (
    <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr_0.8fr_0.7fr_auto]">
      <Field label="Destination" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District or coast" />
      <Field label="Check in" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      <Field label="Check out" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      <Field label="Guests" type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
      <Button onClick={onSearch} className="self-end">Search stays</Button>
    </div>
  );

  return (
    <main>
      <HeroSection compact title="Find stays with island character." subtitle="Search approved hotels, resorts, villas, and guest houses from your live JourniQ backend with real booking request flows." image="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1800&q=85" eyebrow="Hotel discovery">
        <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
          {[
            { label: "Approved owners", icon: ShieldCheck },
            { label: "Room details", icon: BedDouble },
            { label: "Fast requests", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return <div key={item.label} className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm font-extrabold backdrop-blur"><Icon className="mb-2 text-[var(--color-gold)]" size={18} /> {item.label}</div>;
          })}
        </div>
      </HeroSection>

      <section className="tourist-container -mt-10 relative z-10">
        <div className="journiq-panel rounded-[1.75rem] p-4">
          {controls}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[rgba(12,59,53,0.1)] pt-4">
            <button onClick={() => setShowFilters((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-[rgba(12,59,53,0.16)] px-4 py-2 text-sm font-bold text-[var(--color-forest)]"><SlidersHorizontal size={16} /> Filters</button>
            <SelectField label="Sort" value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="max-w-64">
              <option value="recommended">Recommended</option>
              <option value="rating">Rating</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
            </SelectField>
            <div className="ml-auto flex rounded-full bg-[var(--color-muted)] p-1">
              <button aria-label="Grid view" onClick={() => setView("grid")} className={`grid size-10 place-items-center rounded-full ${view === "grid" ? "bg-white shadow-sm" : ""}`}><Grid2X2 size={17} /></button>
              <button aria-label="List view" onClick={() => setView("list")} className={`grid size-10 place-items-center rounded-full ${view === "list" ? "bg-white shadow-sm" : ""}`}><List size={17} /></button>
            </div>
          </div>
          {showFilters ? (
            <div className="mt-4 grid gap-3 rounded-[1.4rem] bg-[var(--color-sand)]/70 p-4 md:grid-cols-3">
              <Field label="Hotel type" value={type} onChange={(e) => setType(e.target.value)} placeholder="Resort, Villa, Hotel" />
              <Field label="Minimum rating" type="number" min={0} max={5} step={0.1} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} />
              <div className="rounded-2xl bg-white/70 p-4 text-sm text-slate-600">Amenities and real-time availability filters are unavailable until the public hotel API returns those fields.</div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="tourist-container mt-12">
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <article className="journiq-dark-panel rounded-[2rem] p-7 text-white">
            <Building2 className="text-[var(--color-gold)]" />
            <h2 className="mt-8 text-4xl leading-none">A stay page that behaves like a booking product.</h2>
            <p className="mt-4 text-sm leading-6 text-white/68">Search at the top, filter when needed, inspect real hotel cards, then open full hotel pages with galleries, room specialties, and booking requests.</p>
          </article>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Live listings", hotels.length],
              ["Visible now", filteredHotels.length],
              ["Min rating", minRating || "Any"],
            ].map(([label, value]) => (
              <div key={label} className="journiq-hover-lift rounded-[1.5rem] bg-white/88 p-5 shadow-[var(--shadow-soft)]">
                <p className="text-3xl font-extrabold leading-none text-[var(--color-midnight)]">{value}</p>
                <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {filteredHotels.length ? (
        <section className="tourist-container mt-10">
          <div className="journiq-marquee overflow-hidden rounded-[1.5rem] border border-[rgba(12,59,53,0.1)] bg-white/78 py-3 shadow-sm">
            <div className="journiq-marquee-track flex gap-3 px-3">
              {[...filteredHotels.slice(0, 8), ...filteredHotels.slice(0, 8)].map((hotel, index) => (
                <div key={`${hotel.id || hotel.name}-${index}`} className="flex min-w-64 items-center justify-between rounded-full bg-[var(--color-muted)] px-4 py-3">
                  <span>
                    <span className="block max-w-40 truncate text-sm font-extrabold text-[var(--color-midnight)]">{hotel.name}</span>
                    <span className="block text-xs font-bold text-[var(--color-teal)]">{hotel.district} · {hotel.type}</span>
                  </span>
                  <span className="journiq-live-dot text-xs font-extrabold text-emerald-700">Live</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="tourist-container mt-14">
        <SectionHeader eyebrow="Available stays" title="Places to land after the day opens up." description={`${filteredHotels.length} hotel listing${filteredHotels.length === 1 ? "" : "s"} matching your current filters.`} />
        <div className="mt-8">
          {loading ? <LoadingSkeleton count={6} /> : null}
          {!loading && error ? <ErrorState message={error} onRetry={() => load()} /> : null}
          {!loading && !error && filteredHotels.length === 0 ? <EmptyState title="No approved hotels found" description="Try another district or clear the rating filter. Hotel listings are loaded from the backend, so this state reflects current approved inventory." actionLabel="Reload hotels" onAction={() => load()} /> : null}
          {!loading && !error && filteredHotels.length > 0 ? (
            <div className={`grid gap-6 ${view === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {filteredHotels.map((hotel) => <HotelCard key={hotel.id || hotel.name} item={hotel} variant={view} onBook={onBook} bookingLoading={bookingLoading} requiresLogin={user?.role !== "tourist"} />)}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
