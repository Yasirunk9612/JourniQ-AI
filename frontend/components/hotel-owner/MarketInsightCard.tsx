import { MarketInsight } from "@/types/hotelOwner";

export default function MarketInsightCard({ insight }: { insight: MarketInsight }) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg text-emerald-950">{insight.country}</h3>
        {insight.model ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black text-amber-800">{insight.model}</span> : null}
      </div>
      <p className="mt-1 text-sm text-emerald-700">Best months: {insight.bestMonths}</p>
      <p className="mt-2 text-sm"><span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800">Demand Score: {insight.demandScore}</span></p>
      <p className="mt-3 text-sm text-emerald-900/80">{insight.recommendation}</p>
    </article>
  );
}
