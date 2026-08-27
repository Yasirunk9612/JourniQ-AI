"use client";

import { FormEvent, useState } from "react";
import { BrainCircuit, Search, Sparkles } from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Recommendation } from "@/lib/public-types";

type Audit = {
  model: { selectedModel: string; note?: string };
  recommendations: Recommendation[];
  preferenceSummary: { terms: string[]; country: string; budget: string; type: string; district: string };
};

export default function RecommendationAuditPage() {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.recommendationAudit({
        preferences: String(fd.get("preferences") || ""),
        country: String(fd.get("country") || ""),
        budget: String(fd.get("budget") || ""),
        type: String(fd.get("type") || "all"),
        district: String(fd.get("district") || ""),
        limit: 10,
      });
      setAudit((res as { audit: Audit }).audit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-emerald-950 p-6 text-white">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-100"><BrainCircuit size={14} /> Model audit</p>
        <h1 className="mt-4 text-4xl font-extrabold">Recommendation audit</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Test recommendation inputs and inspect model output, score, match reasons, country demand, and category balance.</p>
      </section>
      <form onSubmit={run} className="grid gap-3 rounded-[2rem] bg-white p-5 shadow-sm md:grid-cols-5">
        <input name="preferences" className={inputClass} placeholder="culture, beach, hiking" />
        <input name="country" className={inputClass} placeholder="India" />
        <input name="budget" className={inputClass} placeholder="mid range" />
        <select name="type" className={inputClass}><option value="all">All</option><option value="hotel">Hotels</option><option value="experience">Experiences</option></select>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white"><Search size={16} /> {loading ? "Running..." : "Run audit"}</button>
        <input name="district" className={`${inputClass} md:col-span-5`} placeholder="Optional district, e.g. Galle" />
      </form>
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
      {audit ? (
        <section className="space-y-5">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-emerald-950"><Sparkles /> {audit.model.selectedModel} output</h2>
            <p className="mt-2 text-sm text-slate-600">{audit.model.note}</p>
            <div className="mt-4 flex flex-wrap gap-2">{audit.preferenceSummary.terms.map((term) => <span key={term} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{term}</span>)}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {audit.recommendations.map((item) => (
              <article key={`${item.id}-${item.name}`} className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-extrabold text-emerald-950">{item.name}</h3>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-black text-amber-800">{Math.round(item.finalScore * 100)}%</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.district} • {item.category} • {item.type}</p>
                <p className="mt-3 text-xs leading-5 text-emerald-800">{Array.isArray(item.explanation) ? item.explanation.join(" ") : item.explanation}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

const inputClass = "min-h-11 rounded-xl border border-emerald-100 px-3 text-sm outline-none focus:border-emerald-700";
