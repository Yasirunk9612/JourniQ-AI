"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Compass, MapPin, Sparkles } from "lucide-react";
import { Badge, ButtonLink, EmptyState, ErrorState, LoadingSkeleton, Rating } from "@/components/public/TouristUI";
import { Destination } from "@/lib/public-types";
import { publicApi } from "@/lib/publicApi";

const fallbackImage = "https://images.unsplash.com/photo-1586896420943-d3a2bfdcc269?auto=format&fit=crop&w=1800&q=85";

export default function DestinationStoryPage() {
  const params = useParams<{ slug: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!params.slug) return;
    setLoading(true);
    setError("");
    try {
      const res = await publicApi.getDestination(params.slug);
      setDestination(res.destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this destination.");
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const safeCss = useMemo(() => (destination?.blogCss || "").replace(/<\/?style[^>]*>/gi, ""), [destination?.blogCss]);

  if (loading) {
    return (
      <main className="pt-28">
        <section className="tourist-container">
          <LoadingSkeleton count={3} />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-28">
        <section className="tourist-container">
          <ErrorState message={error} onRetry={load} />
        </section>
      </main>
    );
  }

  if (!destination) {
    return (
      <main className="pt-28">
        <section className="tourist-container">
          <EmptyState title="Destination story not found" description="This destination may be unpublished or unavailable." />
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[var(--color-ivory)]">
      <section className="relative min-h-[76vh] overflow-hidden bg-[var(--color-midnight)] text-white">
        <Image src={destination.image || fallbackImage} alt={`${destination.name} in ${destination.district}`} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)] via-[rgba(7,26,34,0.52)] to-[rgba(7,26,34,0.2)]" />
        <div className="tourist-container relative flex min-h-[76vh] flex-col justify-end pb-14 pt-32">
          <Link href="/destinations" className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/18">
            <ArrowLeft className="h-4 w-4" /> Destinations
          </Link>
          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone="gold">{destination.category}</Badge>
              {destination.matchScore ? <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-[var(--color-teal)]">{Math.round(destination.matchScore * 100)}% match for you</span> : <Rating value={destination.rating} />}
            </div>
            <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">{destination.blogTitle || destination.name}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 md:text-lg">{destination.blogExcerpt || destination.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-white/82">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 backdrop-blur"><MapPin className="h-4 w-4" /> {destination.district}{destination.province ? `, ${destination.province}` : ""}</span>
              {destination.bestTime ? <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 backdrop-blur"><CalendarDays className="h-4 w-4" /> {destination.bestTime}</span> : null}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 backdrop-blur"><Compass className="h-4 w-4" /> Sri Lanka guide</span>
            </div>
          </div>
        </div>
      </section>

      <section className="tourist-container grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <style>{`
            .destination-post-scope {
              color: #334155;
              font-size: 1rem;
              line-height: 1.8;
            }
            .destination-post-scope h2,
            .destination-post-scope h3 {
              color: #071A22;
              font-family: var(--font-heading), sans-serif;
              line-height: 1.05;
              margin: 2.25rem 0 1rem;
            }
            .destination-post-scope h2 { font-size: clamp(2rem, 5vw, 3.25rem); }
            .destination-post-scope h3 { font-size: clamp(1.45rem, 4vw, 2rem); }
            .destination-post-scope p { margin: 1rem 0; }
            .destination-post-scope img {
              width: 100%;
              border-radius: 1.5rem;
              margin: 1.5rem 0;
            }
            .destination-post-scope ul,
            .destination-post-scope ol {
              margin: 1.25rem 0;
              padding-left: 1.25rem;
            }
            .destination-post-scope li { margin: 0.45rem 0; }
            .destination-post-scope blockquote {
              border-left: 4px solid #D9A441;
              color: #0C3B35;
              margin: 1.5rem 0;
              padding: 0.5rem 0 0.5rem 1.25rem;
              font-weight: 700;
            }
            ${safeCss}
          `}</style>
          <article className="destination-post-scope rounded-[2rem] border border-[rgba(12,59,53,0.12)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-9">
            {destination.blogHtml ? (
              <div dangerouslySetInnerHTML={{ __html: destination.blogHtml }} />
            ) : (
              <>
                <h2>{destination.name}</h2>
                <p>{destination.description}</p>
              </>
            )}
          </article>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.75rem] border border-[rgba(12,59,53,0.12)] bg-white p-5 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(15,118,110,0.1)] px-3 py-1 text-xs font-extrabold text-[var(--color-teal)]">
              <Sparkles className="h-3.5 w-3.5" /> Personalized signal
            </div>
            {destination.matchReasons?.length ? (
              <div className="space-y-2">
                {destination.matchReasons.map((reason) => <p key={reason} className="rounded-2xl bg-[var(--color-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-forest)]">{reason}</p>)}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-600">Create or update your tourist preferences after registration to rank destinations around your interests.</p>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-[rgba(12,59,53,0.12)] bg-[var(--color-forest)] p-5 text-white shadow-sm">
            <h2 className="font-display text-3xl leading-none">Plan this into a trip</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">Use JourniQ AI to turn this destination into a day-by-day itinerary with hotels and experiences.</p>
            <ButtonLink href={`/ai-trip-planner?destination=${encodeURIComponent(destination.name)}`} className="mt-5 bg-white text-[var(--color-forest)] hover:bg-[var(--color-sand)]">
              Plan with AI
            </ButtonLink>
          </div>

          {destination.tags?.length ? (
            <div className="rounded-[1.75rem] border border-[rgba(12,59,53,0.12)] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-forest)]/75">Travel tags</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.tags.map((tag) => <Badge key={tag} tone="dark">{tag}</Badge>)}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
