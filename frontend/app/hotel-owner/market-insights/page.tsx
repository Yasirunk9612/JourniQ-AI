"use client";

import { BarChart3, Camera, CheckCircle2, LineChart, Sparkles, Target } from "lucide-react";
import { useHotelOwnerAiInsights } from "@/hooks/useHotelOwner";

export default function MarketInsightsPage() {
  const { data, loading, error } = useHotelOwnerAiInsights();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-emerald-950 p-6 text-white shadow-sm md:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-100"><Sparkles size={14} /> Hotel AI intelligence</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">Demand, pricing, and listing quality</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Uses the trained Sri Lankan tourism dataset, your hotel profile, room data, images, amenities, and booking context.</p>
      </section>

      {loading ? <div className="h-80 animate-pulse rounded-[2rem] bg-white" /> : null}
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Metric icon={<LineChart />} label="Demand score" value={`${data.demandScore}/100`} />
            <Metric icon={<Target />} label="Suggested price" value={data.suggestedPriceRange} />
            <Metric icon={<CheckCircle2 />} label="Listing quality" value={`${data.listingQuality.score}%`} />
            <Metric icon={<Camera />} label="Photos" value={`${data.photoSlots.hotel} hotel`} />
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-emerald-950">Quality grade: {data.listingQuality.grade}</h2>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-emerald-50">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${data.listingQuality.score}%` }} />
              </div>
              <div className="mt-5 space-y-2">
                {data.listingQuality.checks.map((check) => (
                  <p key={check.key} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${check.complete ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{check.complete ? "Done" : "Improve"}: {check.label}</p>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-emerald-950">Market analysis</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <List title="Target countries" items={data.targetCountries} />
                <List title="Best months" items={data.bestMonths} />
                <List title="Trending categories" items={data.trendingCategories} />
              </div>
              <div className="mt-5 grid gap-3">
                {data.cards.map((card) => <p key={card} className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{card}</p>)}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-emerald-950"><BarChart3 /> Model summary</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{data.model?.note}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <Small label="Model" value={data.model?.selectedModel || "SVM"} />
              <Small label="Accuracy" value={data.model?.accuracy == null ? "N/A" : `${Math.round(data.model.accuracy * 100)}%`} />
              <Small label="Precision" value={data.model?.precision == null ? "N/A" : `${Math.round(data.model.precision * 100)}%`} />
              <Small label="F1 score" value={data.model?.f1Score == null ? "N/A" : `${Math.round(data.model.f1Score * 100)}%`} />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3 text-emerald-800"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50">{icon}</span><strong className="text-right text-xl text-emerald-950">{value}</strong></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p></article>;
}
function Small({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{label}</p><p className="mt-2 text-xl font-extrabold text-emerald-950">{value}</p></div>;
}
function List({ title, items }: { title: string; items: string[] }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{title}</p><div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item}</span>)}</div></div>;
}
