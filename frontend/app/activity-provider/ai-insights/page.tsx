"use client";

import { CalendarDays, Compass, DollarSign, Sparkles, Target } from "lucide-react";
import { useActivityAiInsights } from "@/hooks/useActivityProvider";

export default function AiInsightsPage() {
  const { insights, loading, error } = useActivityAiInsights();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-emerald-950 p-6 text-white shadow-sm md:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-100"><Sparkles size={14} /> Experience intelligence</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">Audience demand and experience optimization</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Connects your activities, bookings, categories, and trained tourism demand signals.</p>
      </section>
      {loading ? <div className="h-80 animate-pulse rounded-[2rem] bg-white" /> : null}
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
      {insights ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Metric icon={<Target />} label="Demand score" value={`${insights.demandScore}/100`} />
            <Metric icon={<DollarSign />} label="Price signal" value={insights.suggestedPriceRange} />
            <Metric icon={<CalendarDays />} label="Best months" value={insights.bestMonths.slice(0, 2).join(", ")} />
            <Metric icon={<Compass />} label="Quality avg." value={`${insights.listingQuality?.averageScore || 0}%`} />
          </section>
          <section className="grid gap-5 xl:grid-cols-3">
            <Panel title="Target tourists" items={insights.targetCountries} />
            <Panel title="Trending activities" items={insights.trendingCategories} />
            <Panel title="Season window" items={insights.bestMonths} />
          </section>
          <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-emerald-950">Experience quality score</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(insights.listingQuality?.rows || []).map((row) => (
                <article key={row.id} className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-extrabold text-emerald-950">{row.title}</h3>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-800">{row.score}%</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{row.grade}</p>
                  {row.actions.length ? <p className="mt-3 text-xs leading-5 text-amber-700">Next: {row.actions.slice(0, 2).join(", ")}</p> : <p className="mt-3 text-xs font-bold text-emerald-700">Ready for stronger recommendations.</p>}
                </article>
              ))}
            </div>
          </section>
          <section className="grid gap-3 md:grid-cols-3">
            {insights.cards.map((card) => <p key={card} className="rounded-2xl bg-white p-5 text-sm font-semibold leading-6 text-emerald-900 shadow-sm">{card}</p>)}
          </section>
        </>
      ) : null}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3 text-emerald-800"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50">{icon}</span><strong className="text-right text-xl text-emerald-950">{value}</strong></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p></article>;
}
function Panel({ title, items }: { title: string; items: string[] }) {
  return <article className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-extrabold text-emerald-950">{title}</h2><div className="mt-4 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">{item}</span>)}</div></article>;
}
