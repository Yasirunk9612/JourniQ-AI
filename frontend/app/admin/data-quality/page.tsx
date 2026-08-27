"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, DatabaseZap, Sparkles } from "lucide-react";
import { adminApi } from "@/lib/adminApi";

type QualityReport = {
  summary: Record<string, number>;
  qualityRows: Array<{ label: string; value: number; total: number; percent: number }>;
  actions: string[];
  model?: { selectedModel: string; note?: string };
};

export default function DataQualityPage() {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = window.setTimeout(async () => {
      try {
        const res = await adminApi.getDataQuality();
        setReport((res as { report: QualityReport }).report);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load data quality.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-emerald-950 p-6 text-white">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-100"><DatabaseZap size={14} /> AI readiness</p>
        <h1 className="mt-4 text-4xl font-extrabold">Data quality monitor</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Tracks whether the platform has enough preferences, images, tags, descriptions, and destination content to support better recommendations.</p>
      </section>
      {loading ? <div className="h-72 animate-pulse rounded-[2rem] bg-white" /> : null}
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
      {report ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            {Object.entries(report.summary).map(([key, value]) => <article key={key} className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-2xl font-extrabold text-emerald-950">{value}</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{key}</p></article>)}
          </section>
          <section className="grid gap-4 md:grid-cols-2">
            {report.qualityRows.map((row) => (
              <article key={row.label} className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-extrabold text-emerald-950">{row.label}</h2>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">{row.percent}%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${row.percent}%` }} /></div>
                <p className="mt-3 text-sm text-slate-600">{row.value} of {row.total} ready</p>
              </article>
            ))}
          </section>
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-emerald-950"><Sparkles /> Priority actions</h2>
            <div className="mt-4 grid gap-3">
              {report.actions.length ? report.actions.map((action) => <p key={action} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{action}</p>) : <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 className="mr-2 inline" size={16} /> Core AI data quality looks healthy.</p>}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
