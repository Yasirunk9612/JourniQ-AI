"use client";

import { useEffect, useState } from "react";
import { Brain, Compass, DatabaseZap, LineChart, Sparkles, UserRoundCog } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicNavbar from "@/components/public/PublicNavbar";
import SiteFooter from "@/components/public/SiteFooter";
import RecommendationCard from "@/components/public/RecommendationCard";
import { ButtonLink } from "@/components/public/TouristUI";
import { publicApi } from "@/lib/publicApi";
import { PersonalizedRecommendationResponse } from "@/lib/public-types";

type AiProfile = {
  style: string;
  terms: string[];
  completeness: number;
  recommendations: PersonalizedRecommendationResponse["recommendations"];
  model: PersonalizedRecommendationResponse["model"];
};

export default function TouristAiProfilePage() {
  const [profile, setProfile] = useState<AiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = window.setTimeout(async () => {
      try {
        const res = await publicApi.getTouristAiProfile();
        setProfile(res.profile as AiProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load AI profile.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <ProtectedRoute allowedRoles={["tourist"]}>
      <PublicNavbar />
      <main className="bg-[var(--color-ivory)] pb-16 pt-28">
        <section className="tourist-container">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-[var(--color-midnight)] p-6 text-white shadow-[var(--shadow-lift)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(217,164,65,0.34),transparent_30%),radial-gradient(circle_at_86%_4%,rgba(15,118,110,0.42),transparent_34%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-100"><Brain size={14} /> Tourist intelligence</p>
                <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none md:text-7xl">AI travel profile</h1>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-white/70">A transparent view of the signals JourniQ uses to personalize destinations, hotels, experiences, and trip plans.</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-100">Live model</p>
                <p className="mt-3 text-4xl font-black">{profile?.model.selectedModel || "SVM"}</p>
                <p className="mt-2 text-sm leading-6 text-white/62">{profile?.model.note || "Recommendations are grounded in the trained tourism dataset and your profile signals."}</p>
              </div>
            </div>
          </div>

          {loading ? <div className="mt-8 h-80 animate-pulse rounded-[2rem] bg-white" /> : null}
          {error ? <p className="mt-8 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}

          {profile ? (
            <div className="mt-8 space-y-8">
              <section className="grid gap-4 md:grid-cols-4">
                <Metric icon={<Compass />} label="Travel style" value={profile.style} />
                <Metric icon={<Sparkles />} label="Completeness" value={`${profile.completeness}%`} />
                <Metric icon={<UserRoundCog />} label="Signals" value={String(profile.terms.length)} />
                <Metric icon={<LineChart />} label="F1 score" value={profile.model.f1Score == null ? "N/A" : `${Math.round(profile.model.f1Score * 100)}%`} />
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-soft)]">
                  <h2 className="flex items-center gap-2 text-3xl font-black text-[var(--color-midnight)]"><DatabaseZap className="text-[var(--color-teal)]" /> Personalization signals</h2>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-emerald-50"><div className="h-full rounded-full bg-[var(--color-gold)]" style={{ width: `${profile.completeness}%` }} /></div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {profile.terms.length ? profile.terms.map((term) => <span key={term} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">{term}</span>) : <p className="text-sm text-slate-600">No preference signals yet.</p>}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <ButtonLink href="/dashboard" variant="secondary">Edit profile</ButtonLink>
                    <ButtonLink href="/ai-trip-planner" variant="coral">Plan with AI</ButtonLink>
                  </div>
                </article>
                <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-soft)]">
                  <h2 className="text-3xl font-black text-[var(--color-midnight)]">Model explanation</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{profile.model.note}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Small label="Accuracy" value={profile.model.accuracy == null ? "N/A" : `${Math.round(profile.model.accuracy * 100)}%`} />
                    <Small label="Precision" value={profile.model.precision == null ? "N/A" : `${Math.round(profile.model.precision * 100)}%`} />
                    <Small label="Recall" value={profile.model.recall == null ? "N/A" : `${Math.round(profile.model.recall * 100)}%`} />
                  </div>
                </article>
              </section>

              <section>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal)]">Recommended from your AI profile</p>
                    <h2 className="mt-2 text-4xl font-black text-[var(--color-midnight)]">Next places to consider</h2>
                  </div>
                  <ButtonLink href="/recommendations" variant="secondary">Open recommendations</ButtonLink>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {profile.recommendations.map((item) => <RecommendationCard key={`${item.id}-${item.name}`} item={item} />)}
                </div>
              </section>
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </ProtectedRoute>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <article className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-sm"><div className="flex items-center justify-between gap-3 text-[var(--color-teal)]"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-50">{icon}</span><strong className="text-right text-xl text-[var(--color-midnight)]">{value}</strong></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p></article>;
}

function Small({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[var(--color-muted)] p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-[var(--color-midnight)]">{value}</p></div>;
}
