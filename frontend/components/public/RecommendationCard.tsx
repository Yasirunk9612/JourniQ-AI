import { ArrowRight, Brain, MapPin } from "lucide-react";
import { Recommendation } from "@/lib/public-types";
import { Badge, ButtonLink } from "./TouristUI";

export default function RecommendationCard({ item }: { item: Recommendation }) {
  const match = Math.round(item.finalScore * 100);
  const reasons = Array.isArray(item.explanation)
    ? item.explanation.slice(0, 3)
    : item.explanation.split(",").map((part) => part.trim()).filter(Boolean).slice(0, 3);
  const displayReasons = reasons.length ? reasons : ["Recommended from trained tourism score, destination strength, and seasonal demand"];

  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-[var(--shadow-soft)]">
      <div className="absolute right-0 top-0 size-36 rounded-bl-full bg-[rgba(15,118,110,0.09)]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <Badge tone="teal">{item.type ? `${item.type} · ${item.category}` : item.category}</Badge>
          <span className="grid size-16 place-items-center rounded-full bg-[var(--color-midnight)] text-sm font-extrabold text-white">{match}%</span>
        </div>
        <h3 className="mt-5 text-3xl leading-none text-[var(--color-midnight)]">{item.name}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-[var(--color-teal)]"><MapPin size={15} /> {item.district}</p>
        <div className="mt-5 grid gap-2">
          {displayReasons.map((reason) => (
            <p key={reason} className="flex gap-2 rounded-2xl bg-[var(--color-muted)] px-3 py-2 text-sm leading-5 text-slate-700">
              <Brain className="mt-0.5 shrink-0 text-[var(--color-teal)]" size={15} /> {reason}
            </p>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-extrabold text-slate-600">
          <span className="rounded-2xl bg-[rgba(217,164,65,0.14)] px-2 py-2">Content {Math.round(item.contentScore * 100)}%</span>
          <span className="rounded-2xl bg-[rgba(15,118,110,0.1)] px-2 py-2">Demand {Math.round(item.countryDemandScore * 100)}%</span>
          <span className="rounded-2xl bg-[rgba(255,107,74,0.1)] px-2 py-2">{item.bestMonth || "AI"} {item.season ? "season" : "match"}</span>
        </div>
        <ButtonLink href="/ai-trip-planner" variant="secondary" className="mt-5 w-full">
          Build around this <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </article>
  );
}
