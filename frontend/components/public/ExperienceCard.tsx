"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Sparkles, Users } from "lucide-react";
import { Experience } from "@/lib/public-types";
import { Badge, Button, Field, InlineLoading, Rating } from "./TouristUI";
import { formatLkrPrice } from "@/lib/currency";

export default function ExperienceCard({
  item,
  onBook,
  bookingLoading,
  requiresLogin = false,
}: {
  item: Experience;
  onBook?: (payload: { experienceId: string; date: string; guests: number }) => void;
  bookingLoading?: boolean;
  requiresLogin?: boolean;
}) {
  const defaultDate = new Date().toISOString().slice(0, 10);
  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[var(--shadow-soft)]">
      <Link href={item.id ? `/experiences/${item.id}` : "/experiences"} className="relative block h-64 overflow-hidden bg-[var(--color-forest)]">
        {item.image ? (
          <Image
            src={item.image}
            alt={`${item.name} experience in ${item.district}`}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,74,0.32),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(217,164,65,0.28),transparent_24%),linear-gradient(135deg,var(--color-forest),var(--color-midnight))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/15 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <Badge tone="coral">{String(item.category).replace("_", " ")}</Badge>
          <Rating value={item.rating} />
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-3xl leading-none">{item.name}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-white/82"><MapPin size={15} /> {item.district}</p>
        </div>
      </Link>
      <div className="p-5">
        <Link href={item.id ? `/experiences/${item.id}` : "/experiences"} className="line-clamp-3 block text-sm leading-6 text-slate-600 hover:text-[var(--color-teal)]">{item.description}</Link>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
          {item.duration ? <span className="rounded-2xl bg-[var(--color-muted)] px-3 py-2">{item.duration}</span> : <span className="rounded-2xl bg-[var(--color-muted)] px-3 py-2">Flexible time</span>}
          <span className="inline-flex items-center gap-1 rounded-2xl bg-[var(--color-muted)] px-3 py-2"><Users size={14} /> Up to {item.maxGuests || 30}</span>
          {item.ownerName ? <span className="col-span-2 inline-flex items-center gap-1 rounded-2xl bg-[rgba(15,118,110,0.09)] px-3 py-2 text-[var(--color-teal)]"><Sparkles size={14} /> {item.ownerName}</span> : null}
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">From</p>
            <p className="text-2xl font-extrabold text-[var(--color-midnight)]">{formatLkrPrice(item.price)}</p>
          </div>
          <p className="text-xs font-semibold text-slate-500">per person</p>
        </div>
        {item.id ? (
          <form
            className="mt-5 grid gap-3 rounded-[1.3rem] bg-[var(--color-sand)]/60 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onBook?.({
                experienceId: item.id as string,
                date: String(fd.get("date")),
                guests: Number(fd.get("guests") || 1),
              });
            }}
          >
            <Field label="Date" name="date" type="date" defaultValue={defaultDate} required />
            <Field label="Guests" name="guests" type="number" min={1} max={item.maxGuests || 30} defaultValue={1} required />
            <Button type="submit" disabled={bookingLoading} variant="coral" className="w-full">
              {bookingLoading ? <InlineLoading label="Booking..." /> : <><Calendar size={16} /> {requiresLogin ? "Login to book" : "Book experience"}</>}
            </Button>
            <Link href={`/experiences/${item.id}`} className="text-center text-sm font-extrabold text-[var(--color-teal)]">View full experience page</Link>
          </form>
        ) : null}
      </div>
    </article>
  );
}
