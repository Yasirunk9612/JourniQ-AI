import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Destination } from "@/lib/public-types";
import { Badge, Rating } from "./TouristUI";

export default function DestinationCard({
  item,
  variant = "default",
}: {
  item: Destination;
  variant?: "default" | "featured" | "compact";
}) {
  const isFeatured = variant === "featured";
  const href = item.slug ? `/destinations/${item.slug}` : `/destinations?destination=${encodeURIComponent(item.name)}`;

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] bg-[var(--color-midnight)] shadow-[var(--shadow-soft)] ${
        isFeatured ? "min-h-[460px]" : variant === "compact" ? "min-h-64" : "min-h-[390px]"
      }`}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={`${item.name}, ${item.district}`}
          fill
          sizes={isFeatured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,164,65,0.38),transparent_26%),linear-gradient(135deg,var(--color-forest),var(--color-midnight))]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/32 to-black/10" />
      <div className="relative flex h-full min-h-[inherit] flex-col justify-between p-5 text-white md:p-6">
        <div className="flex items-start justify-between gap-3">
          <Badge tone={item.accent === "coral" ? "coral" : item.accent === "gold" ? "gold" : "teal"}>{item.category}</Badge>
          {item.matchScore ? <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-extrabold text-[var(--color-teal)]">{Math.round(item.matchScore * 100)}% match</span> : <Rating value={item.rating} />}
        </div>
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {item.tags?.slice(0, isFeatured ? 4 : 3).map((tag) => (
              <span key={tag} className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-bold backdrop-blur">
                {tag}
              </span>
            ))}
          </div>
          <h3 className={`${isFeatured ? "text-5xl" : "text-3xl"} leading-none`}>{item.name}</h3>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-white/82">
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {item.district}</span>
            {item.bestTime ? <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {item.bestTime}</span> : null}
          </div>
          {variant !== "compact" ? <p className="mt-4 max-w-md text-sm leading-6 text-white/78">{item.description}</p> : null}
          {item.matchReasons?.length ? <p className="mt-3 text-xs font-bold text-amber-100">{item.matchReasons[0]}</p> : null}
          <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-white">
            Explore destination <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
