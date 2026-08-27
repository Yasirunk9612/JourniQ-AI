"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Compass, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { publicApi } from "@/lib/publicApi";
import { Experience } from "@/lib/public-types";
import { Badge, Button, EmptyState, ErrorState, Field, InlineLoading, LoadingSkeleton } from "@/components/public/TouristUI";
import ListingInquiryButton from "@/components/chat/ListingInquiryButton";
import { formatLkrPrice } from "@/lib/currency";

export default function PublicExperienceDetailPage() {
  const params = useParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    setError("");
    try {
      const data = await publicApi.getExperience(params.id);
      setExperience(data.experience);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load experience");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const gallery = useMemo(() => Array.from(new Set([experience?.image, ...(experience?.images || [])].filter(Boolean) as string[])).slice(0, 15), [experience]);

  const book = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!experience?.id) return;
    const fd = new FormData(event.currentTarget);
    try {
      setBookingLoading(true);
      await publicApi.bookExperience({
        experienceId: experience.id,
        date: String(fd.get("date")),
        guests: Number(fd.get("guests") || 1),
      });
      toast.success("Experience booking request sent");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Booking failed";
      toast.error(message.includes("Access denied") || message.includes("Not authorized") ? "Please login as a tourist to book." : message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <main className="tourist-container pt-28"><LoadingSkeleton count={3} /></main>;
  if (error) return <main className="tourist-container pt-28"><ErrorState message={error} onRetry={load} /></main>;
  if (!experience) return <main className="tourist-container pt-28"><EmptyState title="Experience not found" description="This experience may still be pending approval or unavailable." /></main>;

  return (
    <main className="bg-[var(--color-ivory)] pb-20 pt-24">
      <section className="tourist-container">
        <Link href="/experiences" className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--color-teal)]"><ArrowLeft size={16} /> Back to experiences</Link>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <Badge tone="coral">{String(experience.category).replace("_", " ")}</Badge>
            <h1 className="mt-4 text-5xl font-extrabold leading-none text-[var(--color-midnight)] md:text-7xl">{experience.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[var(--color-teal)]"><MapPin size={16} /> {experience.location || experience.district}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/90 p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xl font-extrabold text-[var(--color-midnight)]">{formatLkrPrice(experience.price)} <span className="text-xs text-slate-500">per person</span></p>
            <div className="mt-3 grid gap-2 text-sm font-bold text-slate-600">
              <span className="inline-flex items-center gap-2"><Clock size={15} /> {experience.duration || "Flexible duration"}</span>
              <span className="inline-flex items-center gap-2"><Users size={15} /> Up to {experience.maxGuests || 30} guests</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4 md:grid-rows-2">
          {(gallery.length ? gallery : [""]).slice(0, 5).map((src, index) => (
            <div key={`${src}-${index}`} className={`relative min-h-44 overflow-hidden rounded-[1.5rem] bg-[var(--color-muted)] ${index === 0 ? "md:col-span-2 md:row-span-2 md:min-h-[420px]" : ""}`}>
              {src ? <Image src={src} alt={`${experience.name} gallery image ${index + 1}`} fill sizes={index === 0 ? "50vw" : "25vw"} className="object-cover" /> : null}
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { label: "Local provider", text: experience.ownerName || "Provider details stay connected to the approved listing.", icon: ShieldCheck },
            { label: "Activity rhythm", text: experience.duration || "Duration and group size help tourists plan the day.", icon: Compass },
            { label: "Request first", text: "Booking requests use the existing backend workflow.", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="journiq-hover-lift rounded-[1.35rem] bg-white/88 p-5 shadow-[var(--shadow-soft)]">
                <Icon className="text-[var(--color-coral)]" />
                <h3 className="mt-4 text-2xl leading-none text-[var(--color-midnight)]">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="tourist-container mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <article className="rounded-[1.75rem] bg-white/90 p-7 shadow-[var(--shadow-soft)]">
            <h2 className="text-4xl font-extrabold text-[var(--color-midnight)]">Experience story</h2>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">{experience.description}</p>
          </article>
          <article className="rounded-[1.75rem] bg-white/90 p-7 shadow-[var(--shadow-soft)]">
            <h2 className="text-4xl font-extrabold text-[var(--color-midnight)]">What is included</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(experience.includedItems?.length ? experience.includedItems : ["Provider-guided experience details will be confirmed after booking request."]).map((item) => (
                <p key={item} className="flex gap-2 rounded-2xl bg-[var(--color-muted)] px-4 py-3 text-sm font-bold text-slate-700"><CheckCircle2 className="shrink-0 text-[var(--color-teal)]" size={17} /> {item}</p>
              ))}
            </div>
          </article>
          {experience.safetyNotes ? (
            <article className="rounded-[1.75rem] bg-[var(--color-sand)] p-7 shadow-[var(--shadow-soft)]">
              <h2 className="flex items-center gap-2 text-3xl font-extrabold text-[var(--color-midnight)]"><ShieldCheck className="text-[var(--color-teal)]" /> Safety and notes</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">{experience.safetyNotes}</p>
            </article>
          ) : null}
        </div>

        <aside className="h-fit rounded-[1.75rem] bg-[var(--color-midnight)] p-5 text-white shadow-[var(--shadow-lift)] lg:sticky lg:top-24">
          <h2 className="text-3xl font-extrabold">Request experience</h2>
          <p className="mt-2 text-sm leading-6 text-white/66">This sends the existing backend booking request for tourist accounts.</p>
          <form onSubmit={book} className="mt-5 grid gap-4">
            <Field inverted label="Date" name="date" type="date" required />
            <Field inverted label="Guests" name="guests" type="number" min={1} max={experience.maxGuests || 30} defaultValue={1} required />
            <Button type="submit" disabled={bookingLoading} variant="coral" className="w-full">{bookingLoading ? <InlineLoading label="Booking..." /> : <><Calendar size={16} /> Send booking request</>}</Button>
          </form>
          {experience.id ? <div className="mt-3">
            <ListingInquiryButton contextType="experience" contextId={experience.id} listingName={experience.name} />
          </div> : null}
        </aside>
      </section>
    </main>
  );
}
