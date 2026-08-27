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
  HeartHandshake,
  Map,
  Mountain,
  RefreshCcw,
  Sparkles,
  Waves,
} from "lucide-react";
import CTASection from "@/components/public/CTASection";
import DestinationCard from "@/components/public/DestinationCard";
import ExperienceCard from "@/components/public/ExperienceCard";
import HeroSection from "@/components/public/HeroSection";
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
  const [dataNotice, setDataNotice] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const primaryBudget = user?.touristPreferences?.budgets?.[0] || "";

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

    const [destinationResult, hotelResult, experienceResult, recommendationResult] = await Promise.allSettled([
      publicApi.getDestinations(),
      publicApi.getHotels(),
      publicApi.getExperiences(),
      publicApi.getPersonalizedRecommendations({
        preferences: preferenceText,
        country: user?.country || "",
        budget: primaryBudget,
        type: "all",
        limit: 6,
      }),
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

    if (recommendationResult.status === "fulfilled") {
      setAiRecommendations(recommendationResult.value.recommendations || []);
    } else {
      issues.push("AI recommendations");
    }

    if (issues.length) {
      setDataNotice(`Live ${issues.join(", ")} data could not be loaded. The page is showing only the data that came from the backend.`);
    }
    setLoading(false);
  }, [preferenceText, primaryBudget, user?.country]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

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
    <main>
      <HeroSection
        title="Discover Sri Lanka intelligently, personally, locally."
        subtitle="JourniQ AI turns live provider listings, destination stories, and your travel preferences into a more personal Sri Lankan journey."
        image="https://images.unsplash.com/photo-1588598198321-9735fd52455b?auto=format&fit=crop&w=1800&q=85"
        eyebrow="Tropical intelligence for Sri Lanka"
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/ai-trip-planner" variant="coral">Plan with AI <ArrowRight size={17} /></ButtonLink>
          <ButtonLink href="/destinations" variant="secondary">Explore Sri Lanka</ButtonLink>
        </div>
        <div className="mt-8">
          <SearchBar />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/76">
          <span className="inline-flex items-center gap-2"><BadgeCheck size={16} /> Approved provider inventory</span>
          <span className="hidden h-1 w-1 rounded-full bg-white/50 sm:block" />
          <span>Personalized with your tourist preferences when logged in</span>
        </div>
      </HeroSection>

      <section className="tourist-container -mt-10 relative z-20">
        <div className="rounded-[1.75rem] border border-white/70 bg-[rgba(252,250,246,0.94)] p-4 shadow-[var(--shadow-lift)] backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.25rem] bg-white/82 p-4 shadow-sm">
                <p className="text-3xl font-extrabold leading-none text-[var(--color-midnight)]">{formatCount(stat.value)}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                  <span className="rounded-full bg-[rgba(15,118,110,0.1)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--color-teal)]">
                    API
                  </span>
                </div>
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

      <LiveIslandBoard destinations={destinations} hotels={hotels} experiences={experiences} recommendations={recommendations} />

      <section className="tourist-container mt-20">
        <SectionHeader
          eyebrow="Personal island routes"
          title={user ? `${user.name?.split(" ")[0] || "Traveller"}, start with places that match your profile.` : "Start with places that change the pace."}
          description="Admin-published destinations and travel stories surface beside preference-aware matches, so Sri Lanka discovery feels local instead of generic."
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

      <section className="mt-24 overflow-hidden bg-[var(--color-forest)] py-16 text-white">
        <div className="tourist-container">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <SectionHeader
              inverted
              eyebrow="Stay beautifully"
              title="Live hotel inventory with room-ready booking flows."
              description="Approved hotel-owner listings appear here with real images, room counts, descriptions, and request-booking actions."
              action={{ label: "Browse hotels", href: "/hotels" }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {platformNotes.slice(0, 2).map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[1.4rem] border border-white/12 bg-white/8 p-5 backdrop-blur">
                    <Icon className="text-[var(--color-gold)]" />
                    <h3 className="mt-4 text-xl leading-tight">{item.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/68">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-9">
            {loading && !liveHotels.length ? <LoadingSkeleton count={3} /> : null}
            {!loading && !featuredHotels.length ? (
              <EmptyState title="No approved hotels yet" description="Hotel owner listings will appear here after approval." />
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {featuredHotels.map((hotel) => (
                  <HotelCard key={hotel.id || hotel.name} item={hotel} variant="featured" onBook={hotel.id ? onBookHotel : undefined} bookingLoading={bookingLoading} requiresLogin={user?.role !== "tourist"} />
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
            title="Experiences shaped around culture, activity, and people."
            description="The experience layer stays more energetic than hotel browsing: categories, provider identity, capacity, duration, and booking requests stay visible."
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
            title="Matches that explain why they belong to this tourist."
            description={aiRecommendations.length ? "These recommendations are coming from the live JourniQ recommendation endpoint." : "No recommendation cards are shown until the backend returns model results."}
          />
          <ButtonLink href="/recommendations" variant="secondary" className="mt-6">Open recommendations <ArrowRight size={16} /></ButtonLink>
        </div>
        {visibleRecommendations.length ? (
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
            <Map className="text-[var(--color-teal)]" />
            <h3 className="mt-8 max-w-2xl text-4xl leading-none text-[var(--color-midnight)]">Seasonal inspiration, destination blogs, and preference matches in one tourist flow.</h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              The public screens now line up around the same journey: discover a place, understand why it fits, view real provider inventory, then book or ask the assistant.
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
        <CTASection title="Shape a Sri Lanka trip that feels made for you." description="Start with the AI planner, browse live hotel and experience inventory, then use the assistant when you need help deciding." buttonText="Open AI trip planner" />
      </div>
    </main>
  );
}
