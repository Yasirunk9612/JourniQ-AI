"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Building2,
  CalendarCheck,
  Camera,
  Compass,
  HeartHandshake,
  Hotel as HotelIcon,
  Map,
  Mountain,
  Plane,
  RefreshCcw,
  Route,
  Sparkles,
  Utensils,
  Waves,
} from "lucide-react";
import CTASection from "@/components/public/CTASection";
import DestinationCard from "@/components/public/DestinationCard";
import ExperienceCard from "@/components/public/ExperienceCard";
import HotelCard from "@/components/public/HotelCard";
import LiveIslandBoard from "@/components/public/LiveIslandBoard";
import MotionReveal from "@/components/public/MotionReveal";
import RecommendationCard from "@/components/public/RecommendationCard";
import SearchBar from "@/components/public/SearchBar";
import SectionHeader from "@/components/public/SectionHeader";
import { Badge, Button, ButtonLink, EmptyState, LoadingSkeleton } from "@/components/public/TouristUI";
import { useAuth } from "@/context/AuthContext";
import { publicApi } from "@/lib/publicApi";
import { Destination, Experience, Hotel, Recommendation } from "@/lib/public-types";

const steps = [
  { title: "Profile the traveller", description: "Registration preferences, trip planner inputs, and booking behavior shape each tourist profile.", icon: Sparkles },
  { title: "Score live inventory", description: "Approved hotels, experiences, and destinations are matched with trained tourism signals where available.", icon: Brain },
  { title: "Convert with context", description: "Tourists can move from inspiration into hotel, experience, inquiry, or AI planning flows.", icon: CalendarCheck },
];

const platformNotes = [
  { label: "Approved stays", detail: "Hotel owner inventory with rooms, images, and booking requests.", icon: Building2 },
  { label: "Local experiences", detail: "Activity provider listings designed around culture, food, wildlife, surf, and wellness.", icon: HeartHandshake },
  { label: "Destination stories", detail: "Admin-published Sri Lankan destinations and blog-style discovery pages.", icon: Map },
  { label: "AI matching", detail: "Personalized recommendations from preferences and model-backed scoring.", icon: Brain },
];

const formatCount = (count: number) => (count > 99 ? "99+" : String(count).padStart(2, "0"));

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [liveDestinations, setLiveDestinations] = useState<Destination[]>([]);
  const [liveHotels, setLiveHotels] = useState<Hotel[]>([]);
  const [liveExperiences, setLiveExperiences] = useState<Experience[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [dataNotice, setDataNotice] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const primaryBudget = user?.touristPreferences?.budgets?.[0] || "";
  const userCountry = user?.country || "";

  const preferenceText = useMemo(() => {
    const preferences = user?.touristPreferences;
    const terms = [
      ...(preferences?.interests || []),
      ...(preferences?.travelStyles || []),
      ...(preferences?.preferredDistricts || []),
      ...(preferences?.activityTypes || []),
      ...(preferences?.accommodationTypes || []),
      preferences?.pace || "",
    ].filter(Boolean);
    return terms.length ? terms.join(", ") : "Sri Lanka culture beaches wildlife food heritage";
  }, [user]);

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setDataNotice("");
    const issues: string[] = [];

    const [destinationResult, hotelResult, experienceResult] = await Promise.allSettled([
      publicApi.getDestinations(),
      publicApi.getHotels(),
      publicApi.getExperiences(),
    ]);

    if (destinationResult.status === "fulfilled") {
      setLiveDestinations(destinationResult.value.destinations || []);
    } else {
      issues.push("destinations");
    }

    if (hotelResult.status === "fulfilled") {
      setLiveHotels(hotelResult.value.hotels || []);
    } else {
      issues.push("hotels");
    }

    if (experienceResult.status === "fulfilled") {
      setLiveExperiences(experienceResult.value.experiences || []);
    } else {
      issues.push("experiences");
    }

    if (issues.length) {
      setDataNotice(`Live ${issues.join(", ")} data could not be loaded. The page is showing only the data that came from the backend.`);
    }
    setLoading(false);
  }, []);

  const loadRecommendations = useCallback(async () => {
    setRecommendationsLoading(true);
    try {
      const result = await publicApi.getPersonalizedRecommendations({
        preferences: preferenceText,
        country: userCountry,
        budget: primaryBudget,
        type: "all",
        limit: 6,
      });
      setAiRecommendations(result.recommendations || []);
    } catch {
      setAiRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  }, [preferenceText, primaryBudget, userCountry]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  useEffect(() => {
    if (!loading) {
      loadRecommendations();
    }
  }, [loadRecommendations, loading]);

  const destinations = liveDestinations;
  const hotels = liveHotels;
  const experiences = liveExperiences;
  const recommendations = aiRecommendations;
  const featuredDestination = destinations[0];
  const supportingDestinations = destinations.filter((item) => item.name !== featuredDestination?.name).slice(0, 3);
  const featuredHotels = hotels.slice(0, 3);
  const featuredExperiences = experiences.slice(0, 3);
  const visibleRecommendations = recommendations.slice(0, 3);
  const categories = Array.from(new Set(experiences.map((item) => String(item.category).replace("_", " ")))).slice(0, 8);
  const dreamTiles = [
    {
      label: "Golden beaches",
      text: "Bentota, Mirissa, Unawatuna",
      icon: Waves,
      tone: "from-[#f8c66a] to-[#ff6b4a]",
      image: "/images/mirissa-sri-lanka.jpg",
      place: "Mirissa coast",
      signal: "Sunset surf · Coconut Tree Hill",
    },
    {
      label: "Misty highlands",
      text: "Ella, Nuwara Eliya, tea trails",
      icon: Mountain,
      tone: "from-[#0f766e] to-[#9fbf72]",
      image: "/images/sri-lanka-highlands.jpg",
      place: "Ella tea country",
      signal: "Tuk tuk rides · Morning mist",
    },
    {
      label: "Food trails",
      text: "Hoppers, kottu, seafood nights",
      icon: Utensils,
      tone: "from-[#ff6b4a] to-[#d9a441]",
      image: "/images/pol-rotti-coconut-sambol.jpg",
      place: "Colombo food walk",
      signal: "Hoppers · Kottu · Crab curry",
    },
    {
      label: "Culture shots",
      text: "Temples, forts, village life",
      icon: Camera,
      tone: "from-[#071a22] to-[#0f766e]",
      image: "/images/yapahuwa-rock-fortress-sri-lanka.jpg",
      place: "Yapahuwa & Galle",
      signal: "Stone kingdoms · Fort sunsets",
    },
  ];

  const stats = [
    { label: "Destinations", value: liveDestinations.length },
    { label: "Approved hotels", value: liveHotels.length },
    { label: "Experiences", value: liveExperiences.length },
    { label: "AI matches", value: aiRecommendations.length },
  ];

  const onBookHotel = async (payload: { hotelId: string; checkIn: string; checkOut: string; guests: number }) => {
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

  const onBookExperience = async (payload: { experienceId: string; date: string; guests: number }) => {
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
    <main className="overflow-hidden">
      <section className="surface-noise relative min-h-[820px] overflow-hidden bg-[var(--color-midnight)] pt-36 text-white md:pt-40">
        <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('/images/blue-beach-island.jpg')" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(217,164,65,0.34),transparent_24%),linear-gradient(105deg,rgba(7,26,34,0.96)_0%,rgba(7,26,34,0.82)_46%,rgba(7,26,34,0.35)_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] journiq-map-grid" />
        <div className="absolute -right-20 top-20 hidden h-[640px] w-[640px] rounded-full border border-white/10 lg:block" />
        <div className="absolute left-[52%] top-28 hidden h-[460px] w-[460px] rounded-full bg-[conic-gradient(from_180deg,rgba(255,107,74,0.28),rgba(217,164,65,0.24),rgba(15,118,110,0.18),rgba(255,107,74,0.28))] blur-3xl lg:block" />

        <div className="tourist-container relative grid gap-12 pb-24 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <MotionReveal>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--color-gold)] backdrop-blur">
              AI-powered Sri Lanka planner
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.055em] md:text-7xl xl:text-8xl">
              Your Sri Lanka trip, planned by AI.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-xl">
              JourniQ AI blends your travel style with Sri Lankan beaches, tea country, heritage cities, wildlife, local stays, and real provider inventory.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/ai-trip-planner" variant="coral" className="min-h-13 px-6">Generate my route <ArrowRight size={17} /></ButtonLink>
              <ButtonLink href="/recommendations" variant="secondary" className="min-h-13 bg-white text-[var(--color-midnight)]">See AI matches</ButtonLink>
            </div>
            <div className="mt-8 max-w-3xl">
              <SearchBar />
            </div>
            <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["01", "Read your preferences"],
                ["02", "Rank Sri Lanka places"],
                ["03", "Connect bookings"],
              ].map(([count, label]) => (
                <div key={count} className="rounded-[1.2rem] border border-white/12 bg-white/10 p-3 backdrop-blur">
                  <p className="text-xs font-black text-[var(--color-gold)]">{count}</p>
                  <p className="mt-1 text-sm font-bold leading-5 text-white/78">{label}</p>
                </div>
              ))}
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08}>
            <div className="relative mx-auto w-full max-w-2xl lg:mr-0">
              <div className="rounded-[2.4rem] border border-white/16 bg-white/10 p-3 shadow-[var(--shadow-lift)] backdrop-blur-2xl">
                <div className="overflow-hidden rounded-[2rem] bg-[var(--color-ivory)] text-[var(--color-midnight)]">
                  <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
                    <div className="relative min-h-[410px] bg-cover bg-center" style={{ backgroundImage: "url('/images/galle-fort-travel-guide-sri-lanka.jpg')" }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,34,0.62)] to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 rounded-[1.3rem] bg-white/90 p-4 backdrop-blur">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal)]">Sri Lanka route</p>
                        <p className="mt-1 text-xl font-black">Sigiriya → Ella → Mirissa</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-coral)]">JourniQ AI engine</p>
                          <h3 className="mt-2 text-2xl leading-none">Smart trip composer</h3>
                        </div>
                      </div>
                      <div className="mt-6 grid gap-3">
                        {[
                          ["Mood", "Beach + culture + food"],
                          ["Pace", "Balanced, 7 days"],
                          ["Best next", featuredDestination?.name || "Ella highlands"],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-2xl border border-[rgba(12,59,53,0.1)] bg-white p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
                            <p className="mt-1 font-black">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 rounded-2xl bg-[var(--color-midnight)] p-4 text-white">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-gold)]">AI confidence</p>
                        <div className="mt-3 h-2 rounded-full bg-white/14">
                          <div className="h-full w-[82%] rounded-full bg-[var(--color-coral)]" />
                        </div>
                        <p className="mt-3 text-sm text-white/66">Matches live destinations, hotels, experiences, and your traveller profile.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-4 top-10 hidden rounded-[1.4rem] border border-white/16 bg-white/92 p-4 text-[var(--color-midnight)] shadow-[var(--shadow-lift)] backdrop-blur lg:block">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-teal)]"><Compass size={15} /> Live model</p>
                <p className="mt-2 max-w-40 text-sm font-bold leading-5">SVM recommender ready for tourist intent.</p>
              </div>
              <div className="absolute -bottom-5 right-8 rounded-[1.5rem] border border-white/16 bg-[var(--color-coral)] p-5 text-white shadow-[var(--shadow-lift)]">
                <p className="text-4xl font-black leading-none">{formatCount(stats.reduce((sum, item) => sum + item.value, 0))}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-white/72">Live travel items</p>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="tourist-container relative z-20 -mt-12">
        <div className="rounded-[2rem] border border-white/70 bg-[rgba(252,250,246,0.94)] p-4 shadow-[var(--shadow-lift)] backdrop-blur">
          <div className="grid gap-3 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.45rem] bg-white p-5 shadow-sm">
                <p className="text-4xl font-black leading-none text-[var(--color-midnight)]">{formatCount(stat.value)}</p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
          {dataNotice ? (
            <div className="mt-4 flex flex-col gap-3 rounded-[1.1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <span>{dataNotice}</span>
              <Button type="button" variant="secondary" onClick={loadHomeData} className="bg-white">
                <RefreshCcw size={15} /> Retry
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="tourist-container mt-24">
        <div className="grid gap-5 lg:grid-cols-4">
          {dreamTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <MotionReveal key={tile.label}>
                <article className="journiq-hover-lift group relative min-h-[380px] overflow-hidden rounded-[2rem] border border-white/70 bg-[var(--color-midnight)] p-4 shadow-[var(--shadow-soft)]">
                  <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110" style={{ backgroundImage: `url("${tile.image}")` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,26,34,0.96)] via-[rgba(7,26,34,0.45)] to-[rgba(7,26,34,0.1)]" />
                  <div className={`absolute -right-10 -top-10 size-36 rounded-full bg-gradient-to-br ${tile.tone} opacity-80 blur-2xl`} />
                  <div className="absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
                  <div className="relative flex h-full min-h-[348px] flex-col justify-between rounded-[1.55rem] border border-white/12 p-5 text-white">
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-2xl bg-white/90 text-[var(--color-midnight)] shadow-lg">
                        <Icon size={23} />
                      </span>
                      <span className="rounded-full border border-white/16 bg-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur">
                        Live vibe
                      </span>
                    </div>
                    <div>
                      <p className="journiq-live-dot mb-3 text-xs font-black uppercase tracking-[0.16em] text-emerald-100">{tile.place}</p>
                      <h3 className="max-w-56 text-4xl font-black leading-none">{tile.label}</h3>
                      <p className="mt-3 text-sm font-semibold leading-6 text-white/76">{tile.text}</p>
                      <div className="mt-4 rounded-2xl border border-white/12 bg-white/12 p-3 backdrop-blur">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--color-gold)]">Traveller feeling</p>
                        <p className="mt-1 text-sm font-bold text-white/82">{tile.signal}</p>
                      </div>
                      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/16">
                        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${tile.tone}`} />
                      </div>
                    </div>
                  </div>
                </article>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      <LiveIslandBoard destinations={destinations} hotels={hotels} experiences={experiences} recommendations={recommendations} />

      <section className="tourist-container mt-24">
        <SectionHeader
          eyebrow="Island mood board"
          title={user ? `${user.name?.split(" ")[0] || "Traveller"}, your Sri Lanka starts here.` : "Choose the places that match your travel mood."}
          description="A richer destination layer for beaches, highlands, heritage towns, wildlife zones, and culture-first travel stories."
          action={{ label: "All destinations", href: "/destinations" }}
        />
        <div className="mt-9 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          {loading && !featuredDestination ? (
            <div className="lg:col-span-2"><LoadingSkeleton count={3} /></div>
          ) : featuredDestination ? (
            <MotionReveal><DestinationCard item={featuredDestination} variant="featured" /></MotionReveal>
          ) : (
            <EmptyState title="No destinations published yet" description="Admin destination stories will appear here after publishing." />
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {supportingDestinations.map((item, index) => (
              <MotionReveal key={item.slug || item.name} delay={index * 0.06}><DestinationCard item={item} variant="compact" /></MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mt-24 overflow-hidden py-24">
        <div className="absolute inset-x-0 top-0 h-[68%] rounded-b-[3rem] bg-[var(--color-midnight)]" />
        <div className="absolute inset-x-0 top-0 h-[68%] opacity-30 [background-image:radial-gradient(circle_at_18%_18%,#D9A441,transparent_24%),radial-gradient(circle_at_82%_22%,#0F766E,transparent_28%)]" />
        <div className="tourist-container relative">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--color-gold)] backdrop-blur">
                <HotelIcon size={15} /> Stay beautifully
              </p>
              <h2 className="mt-5 max-w-3xl text-5xl leading-[0.92] text-white md:text-7xl">Sleep closer to the island feeling.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">Approved hotels, villas, guest houses, and hill-country stays appear with real rooms, images, booking requests, and owner-managed details.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/hotels" variant="coral">Browse stays <ArrowRight size={16} /></ButtonLink>
                <ButtonLink href="/ai-trip-planner" variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/16">Match by AI</ButtonLink>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Beach villas", icon: Waves },
                { label: "Tea view stays", icon: Mountain },
                { label: "City comfort", icon: Building2 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5 text-white backdrop-blur">
                    <Icon className="text-[var(--color-gold)]" />
                    <p className="mt-5 font-black">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 rounded-[2.25rem] border border-white/70 bg-[var(--color-ivory)] p-4 shadow-[var(--shadow-lift)]">
            {loading && !liveHotels.length ? <LoadingSkeleton count={3} /> : null}
            {!loading && !featuredHotels.length ? (
              <EmptyState title="No approved hotels yet" description="Hotel owner listings will appear here after approval." />
            ) : (
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.95fr_0.95fr]">
                {featuredHotels.map((hotel, index) => (
                  <div key={hotel.id || hotel.name} className={index === 0 ? "lg:[&>*]:h-full" : ""}>
                    <HotelCard item={hotel} variant="featured" onBook={hotel.id ? onBookHotel : undefined} bookingLoading={bookingLoading} requiresLogin={user?.role !== "tourist"} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="tourist-container mt-24">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <SectionHeader
            eyebrow="Local pulse"
            title="Book the island, not just the itinerary."
            description="Surf at sunrise, cook in a village kitchen, hike into mist, watch wildlife, and meet real local providers."
          />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((item) => (
              <Badge key={item} tone="coral">{item}</Badge>
            ))}
          </div>
        </div>
        <div className="mt-8">
          {loading && !liveExperiences.length ? <LoadingSkeleton count={3} /> : null}
          {!loading && !featuredExperiences.length ? (
            <EmptyState title="No approved experiences yet" description="Activity provider experiences will appear here after approval." />
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {featuredExperiences.map((item) => (
                <ExperienceCard key={item.id || item.name} item={item} onBook={item.id ? onBookExperience : undefined} bookingLoading={bookingLoading} requiresLogin={user?.role !== "tourist"} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="tourist-container mt-24">
        <div className="mb-10 grid gap-6 rounded-[2.25rem] bg-[var(--color-sand)] p-6 shadow-[var(--shadow-soft)] lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-coral)]">Designed for the tourist flow</p>
            <h2 className="mt-3 text-4xl leading-none text-[var(--color-midnight)] md:text-6xl">From dream scroll to booked journey.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Discover", icon: Plane },
              { label: "Match", icon: Brain },
              { label: "Book", icon: BadgeCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[1.5rem] bg-white/78 p-5">
                  <Icon className="text-[var(--color-teal)]" />
                  <p className="mt-4 font-black text-[var(--color-midnight)]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <MotionReveal key={step.title} delay={index * 0.05}>
                <article className="min-h-72 rounded-[1.75rem] bg-[var(--color-midnight)] p-6 text-white shadow-[var(--shadow-soft)]">
                  <div className="flex items-center justify-between">
                    <Icon className="text-[var(--color-gold)]" />
                    <span className="text-5xl font-extrabold text-white/12">0{index + 1}</span>
                  </div>
                  <h3 className="mt-12 text-3xl leading-none">{step.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-white/68">{step.description}</p>
                </article>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      <section className="tourist-container mt-24 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div className="sticky top-24">
          <SectionHeader
            eyebrow="AI recommendation surface"
            title="Smart matches with reasons behind the vibe."
            description={aiRecommendations.length ? "These recommendations are coming from the live JourniQ recommendation endpoint." : "Recommendations load after the main travel inventory so the page appears faster."}
          />
          <ButtonLink href="/recommendations" variant="secondary" className="mt-6">Open recommendations <ArrowRight size={16} /></ButtonLink>
        </div>
        {recommendationsLoading ? (
          <LoadingSkeleton count={3} />
        ) : visibleRecommendations.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleRecommendations.map((item) => (
              <RecommendationCard key={item.id || item.name} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState title="No live AI recommendations yet" description="Recommendations will appear here after the backend returns model-ranked items for the current traveller profile." />
        )}
      </section>

      <section className="tourist-container mt-24">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] bg-[var(--color-sand)] p-8 shadow-[var(--shadow-soft)]">
            <Route className="text-[var(--color-teal)]" />
            <h3 className="mt-8 max-w-2xl text-4xl leading-none text-[var(--color-midnight)]">Build a trip like a cinematic island route.</h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Move from destination inspiration into hotels, experiences, AI recommendations, and booking requests without losing the Sri Lankan travel feeling.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {platformNotes.slice(2).map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[1.25rem] bg-white/70 p-5">
                    <Icon className="text-[var(--color-coral)]" />
                    <h4 className="mt-4 font-extrabold text-[var(--color-midnight)]">{item.label}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </article>
          <article className="overflow-hidden rounded-[2rem] bg-[var(--color-midnight)] p-8 text-white shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[var(--color-gold)]">
                {categories.some((item) => item.toLowerCase().includes("surf")) ? <Waves /> : categories.some((item) => item.toLowerCase().includes("hiking")) ? <Mountain /> : <HeartHandshake />}
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/55">Current discovery mix</p>
                <h3 className="text-2xl leading-none">Built from your live platform data</h3>
              </div>
            </div>
            <div className="mt-8 grid gap-3">
              {[...categories.slice(0, 5), "AI planner", "Real bookings"].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/7 px-4 py-3">
                  <span className="font-bold">{item}</span>
                  <ArrowRight size={16} className="text-white/45" />
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <div className="tourist-container mt-24">
        <CTASection title="Ready for a Sri Lanka trip with better taste?" description="Start with the AI planner, browse live stays and experiences, then let JourniQ AI guide your next island decision." buttonText="Open AI trip planner" />
      </div>
    </main>
  );
}
