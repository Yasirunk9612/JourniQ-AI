"use client";

import { useEffect, useState } from "react";
import { BarChart3, Brain, Database, Sparkles } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminApi, TourismAnalyticsResponse } from "@/lib/adminApi";

export default function TourismAnalyticsPage() {
  const [data, setData] = useState<TourismAnalyticsResponse["analytics"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const id = window.setTimeout(async () => {
      try {
        const res = await adminApi.getTourismAnalytics();
        setData(res.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load analytics.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-emerald-950 p-6 text-white">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-100"><Sparkles size={14} /> Platform intelligence</p>
        <h1 className="mt-4 text-4xl font-extrabold">Tourism demand analytics</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Dataset-level country, district, category, and seasonal signals used to guide recommendations and provider insights.</p>
      </section>
      {loading ? <div className="h-72 animate-pulse rounded-[2rem] bg-white" /> : null}
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Metric icon={<Database />} label="Dataset rows" value={String(data.datasetRows)} />
            <Metric icon={<Brain />} label="Model" value={data.model.selectedModel} />
            <Metric icon={<BarChart3 />} label="Avg AI score" value={`${data.avgAiScore}/100`} />
            <Metric icon={<Sparkles />} label="Recommended rows" value={String(data.recommendedRows)} />
          </section>
          <section className="grid gap-5 xl:grid-cols-2">
            <Chart title="Top source markets" data={data.countries} />
            <Chart title="Popular districts" data={data.districts} />
            <Chart title="Category demand" data={data.categories} />
            <Chart title="Seasonal month signals" data={data.months} />
          </section>
        </>
      ) : null}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <article className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-emerald-800"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50">{icon}</span><strong className="text-xl text-emerald-950">{value}</strong></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p></article>;
}
function Chart({ title, data }: { title: string; data: Array<{ name: string; value: number }> }) {
  return (
    <article className="min-w-0 rounded-[2rem] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-extrabold text-emerald-950">{title}</h2>
      <div className="mt-4 h-72 min-h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
