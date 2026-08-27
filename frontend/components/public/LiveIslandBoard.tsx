import Link from "next/link";
import { ArrowRight, Brain, Building2, Compass, MapPinned, Sparkles } from "lucide-react";
import { Destination, Experience, Hotel, Recommendation } from "@/lib/public-types";
import { Badge } from "./TouristUI";

export default function LiveIslandBoard({
  destinations,
  hotels,
  experiences,
  recommendations,
}: {
  destinations: Destination[];
  hotels: Hotel[];
  experiences: Experience[];
  recommendations: Recommendation[];
}) {
  const feed = [
    ...destinations.slice(0, 4).map((item) => ({ label: item.name, meta: item.district, href: item.slug ? `/destinations/${item.slug}` : "/destinations", tone: "Destination" })),
    ...hotels.slice(0, 4).map((item) => ({ label: item.name, meta: item.district, href: item.id ? `/hotels/${item.id}` : "/hotels", tone: "Stay" })),
    ...experiences.slice(0, 4).map((item) => ({ label: item.name, meta: item.district, href: item.id ? `/experiences/${item.id}` : "/experiences", tone: "Experience" })),
    ...recommendations.slice(0, 3).map((item) => ({ label: item.name, meta: `${Math.round(item.finalScore * 100)}% match`, href: "/recommendations", tone: "AI match" })),
  ];
  const marquee = [...feed, ...feed];

  return (
    <section className="tourist-container mt-14">
      <div className="journiq-dark-panel overflow-hidden rounded-[2rem] p-5 text-white md:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-100">
              <span className="journiq-live-dot">Live system layer</span>
            </div>
            <h2 className="mt-5 text-4xl leading-none md:text-5xl">The guest side now breathes with real JourniQ data.</h2>
            <p className="mt-4 text-sm leading-6 text-white/68">Destinations, hotels, experiences, and AI matches are pulled into the public journey as visible signals, not hidden behind plain lists.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Destinations", value: destinations.length, icon: MapPinned },
              { label: "Hotels", value: hotels.length, icon: Building2 },
              { label: "Experiences", value: experiences.length, icon: Compass },
              { label: "AI matches", value: recommendations.length, icon: Brain },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                  <div className="flex items-center justify-between">
                    <Icon className="text-[var(--color-gold)]" />
                    <span className="text-3xl font-extrabold">{item.value}</span>
                  </div>
                  <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-white/55">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
        {feed.length ? (
          <div className="journiq-marquee mt-7 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/7 py-3">
            <div className="journiq-marquee-track flex gap-3 px-3">
              {marquee.map((item, index) => (
                <Link key={`${item.label}-${index}`} href={item.href} className="group flex min-w-64 items-center justify-between gap-4 rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/16">
                  <span>
                    <span className="block max-w-44 truncate">{item.label}</span>
                    <span className="block text-xs font-semibold text-white/55">{item.meta}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge tone="gold">{item.tone}</Badge>
                    <ArrowRight size={15} className="opacity-55 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/7 p-5 text-sm font-semibold text-white/68">
            <Sparkles className="mb-3 text-[var(--color-gold)]" /> Live rows will appear here after public inventory is available.
          </div>
        )}
      </div>
    </section>
  );
}
