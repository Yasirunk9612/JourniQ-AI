"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import HeroSection from "@/components/public/HeroSection";
import RecommendationCard from "@/components/public/RecommendationCard";
import SectionHeader from "@/components/public/SectionHeader";
import { Badge, Button, EmptyState, ErrorState, Field, LoadingSkeleton, SelectField, TextArea } from "@/components/public/TouristUI";
import { publicApi } from "@/lib/publicApi";
import { PersonalizedRecommendationResponse, Recommendation } from "@/lib/public-types";
import { BrainCircuit, Gauge, SlidersHorizontal, Sparkles } from "lucide-react";

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState("");
  const [country, setCountry] = useState(user?.country || "Sri Lanka");
  const [budget, setBudget] = useState("mid-range");
  const [type, setType] = useState("all");
  const [district, setDistrict] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState<PersonalizedRecommendationResponse | null>(null);

  useEffect(() => {
    if (!user?.touristPreferences) return;
    const saved = user.touristPreferences;
    const savedPreferences = [
      ...(saved.interests || []),
      ...(saved.travelStyles || []),
      ...(saved.activityTypes || []),
      ...(saved.accommodationTypes || []),
    ].join(", ");
    if (savedPreferences && !preferences) setPreferences(savedPreferences);
    if (saved.budgets?.[0]) setBudget(saved.budgets[0]);
    if (saved.preferredDistricts?.[0]) setDistrict(saved.preferredDistricts[0]);
  }, [preferences, user?.touristPreferences]);

  const visible = useMemo(() => {
    if (aiResult) return aiResult.recommendations;
    return [];
  }, [aiResult]);

  const loadRecommendations = async () => {
    setSubmitted(true);
    setLoading(true);
    setError("");
    try {
      const result = await publicApi.getPersonalizedRecommendations({
        preferences,
        country,
        budget,
        type,
        district,
        limit: 12,
      });
      setAiResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load personalized recommendations.";
      setError(message);
      setAiResult(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await loadRecommendations();
  };

  return (
    <main>
      <HeroSection compact title="Personalized Sri Lanka recommendations from your trained tourism model." subtitle="Tell JourniQ AI what kind of trip you want. The system ranks destinations, stays, and experiences using the trained dataset, SVM model selection, seasonal demand, and preference matching." image="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1800&q=85" eyebrow={user ? `Welcome back, ${user.name}` : "AI recommendations"}>
        <div className="grid max-w-4xl gap-3 sm:grid-cols-3">
          {[
            { label: "Preference input", icon: SlidersHorizontal },
            { label: "Model signal", icon: BrainCircuit },
            { label: "Explainable cards", icon: Gauge },
          ].map((item) => {
            const Icon = item.icon;
            return <div key={item.label} className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm font-extrabold backdrop-blur"><Icon className="mb-2 text-[var(--color-gold)]" size={18} /> {item.label}</div>;
          })}
        </div>
      </HeroSection>

      <section className="tourist-container -mt-10 relative z-10">
        <form onSubmit={onSubmit} className="journiq-panel rounded-[1.75rem] p-5">
          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.65fr_0.65fr_0.65fr_0.65fr]">
            <TextArea label="Travel preferences" required value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Example: beaches, food, heritage, slow pace, 7 days..." className="min-h-28" />
            <Field label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
            <Field label="Preferred district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Galle, Kandy..." />
            <SelectField label="Budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="premium">Premium</option>
            </SelectField>
            <SelectField label="Item type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Hotels + experiences</option>
              <option value="hotel">Hotels</option>
              <option value="experience">Experiences</option>
              <option value="place">Places</option>
            </SelectField>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-600">
              {aiResult ? aiResult.model.note : "Submit your preferences to fetch live model recommendations from the backend."}
            </p>
            <Button type="submit" disabled={loading}>{loading ? "Personalizing..." : "Personalize my results"}</Button>
          </div>
        </form>
      </section>

      <section className="tourist-container mt-12">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="journiq-dark-panel rounded-[2rem] p-7 text-white">
            <Sparkles className="text-[var(--color-gold)]" />
            <h2 className="mt-8 text-4xl leading-none">This page should feel personal before it feels technical.</h2>
            <p className="mt-4 text-sm leading-6 text-white/68">Tourists see the travel reasoning in human language, while model notes stay visible without turning the UI into a data dashboard.</p>
          </article>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Visible matches", visible.length],
              ["Budget", budget],
              ["Type", type === "all" ? "Mixed" : type],
            ].map(([label, value]) => (
              <div key={label} className="journiq-hover-lift rounded-[1.5rem] bg-white/88 p-5 shadow-[var(--shadow-soft)]">
                <p className="text-2xl font-extrabold leading-none text-[var(--color-midnight)]">{value}</p>
                <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {visible.length ? (
        <section className="tourist-container mt-10">
          <div className="journiq-marquee overflow-hidden rounded-[1.5rem] border border-[rgba(12,59,53,0.1)] bg-white/78 py-3 shadow-sm">
            <div className="journiq-marquee-track flex gap-3 px-3">
              {[...visible.slice(0, 8), ...visible.slice(0, 8)].map((item, index) => (
                <div key={`${item.id || item.name}-${index}`} className="flex min-w-72 items-center justify-between rounded-full bg-[var(--color-muted)] px-4 py-3">
                  <span>
                    <span className="block max-w-48 truncate text-sm font-extrabold text-[var(--color-midnight)]">{item.name}</span>
                    <span className="block text-xs font-bold text-[var(--color-teal)]">{item.district} · {Math.round(item.finalScore * 100)}% match</span>
                  </span>
                  <span className="journiq-live-dot text-xs font-extrabold text-emerald-700">Model</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="tourist-container mt-14">
        <SectionHeader
          eyebrow={aiResult ? `${aiResult.model.selectedModel} model selected` : "Live personalization"}
          title="Matches that explain the travel logic."
          description={
            submitted
              ? `Preference summary: ${preferences.slice(0, 130)}${preferences.length > 130 ? "..." : ""}`
              : "Add preferences above to get trained-dataset recommendations."
          }
        />
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="teal">{country}</Badge>
          <Badge tone="gold">{budget}</Badge>
          <Badge tone="coral">{type === "all" ? "mixed results" : type}</Badge>
          {district ? <Badge tone="dark">{district}</Badge> : null}
          {aiResult?.model.f1Score ? <Badge tone="teal">F1 {(aiResult.model.f1Score * 100).toFixed(1)}%</Badge> : null}
        </div>
        {error ? <div className="mt-8"><ErrorState message={error} onRetry={() => void loadRecommendations()} /></div> : null}
        {loading ? <div className="mt-8"><LoadingSkeleton count={6} /></div> : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {!loading && !error ? visible.map((item: Recommendation) => <RecommendationCard key={`${item.id || item.name}-${item.district}`} item={item} />) : null}
        </div>
        {!loading && !error && visible.length === 0 ? <div className="mt-8"><EmptyState title="No personalized recommendations found" description="Try a broader district, choose mixed results, or describe your interests with more travel words." /></div> : null}
      </section>
    </main>
  );
}
