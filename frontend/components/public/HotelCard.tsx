"use client";

import Image from "next/image";
import Link from "next/link";
import { BedDouble, CalendarDays, Heart, MapPin, Star, Users } from "lucide-react";
import { Hotel } from "@/lib/public-types";
import { Badge, Button, Field, InlineLoading } from "./TouristUI";
import { formatLkrPrice } from "@/lib/currency";

export default function HotelCard({
  item,
  onBook,
  bookingLoading,
  variant = "grid",
}: {
  item: Hotel;
  onBook?: (payload: { hotelId: string; checkIn: string; checkOut: string; guests: number }) => void;
  bookingLoading?: boolean;
  variant?: "grid" | "list" | "featured";
}) {
  const checkInDate = new Date();
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 1);
  const defaultCheckIn = checkInDate.toISOString().slice(0, 10);
  const defaultCheckOut = checkOutDate.toISOString().slice(0, 10);
  const layout = variant === "list" ? "md:grid md:grid-cols-[280px_1fr]" : "";

  return (
    <article className={`group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/88 shadow-[var(--shadow-soft)] backdrop-blur ${layout}`}>
      <Link href={item.id ? `/hotels/${item.id}` : "/hotels"} className={`relative block bg-[var(--color-muted)] ${variant === "list" ? "min-h-72 md:min-h-full" : "h-60"}`}>
        {item.image ? (
          <Image
            src={item.image}
            alt={`${item.name} hotel in ${item.district}`}
            fill
            sizes={variant === "list" ? "280px" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(217,164,65,0.38),transparent_28%),linear-gradient(135deg,#dbe8e5,#87b8ae)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/54 via-transparent to-transparent" />
        <span aria-label="Favourites are not connected yet" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/88 text-[var(--color-forest)] shadow-sm" title="Favourites are not connected yet">
          <Heart size={18} />
        </span>
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <Badge tone="gold">{item.type}</Badge>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-[#8a6117]"><Star size={13} /> {item.rating}</span>
        </div>
      </Link>
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={item.id ? `/hotels/${item.id}` : "/hotels"} className="block text-3xl font-extrabold leading-none text-[var(--color-midnight)] hover:text-[var(--color-teal)]">{item.name}</Link>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-teal)]"><MapPin size={15} /> {item.district}</p>
          </div>
          <p className="shrink-0 text-right text-sm font-extrabold text-[var(--color-midnight)]">{formatLkrPrice(item.price)}</p>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{item.description || "Authentic Sri Lankan stay experience."}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-2xl bg-[var(--color-muted)] px-3 py-2"><BedDouble size={14} /> {item.rooms} rooms</span>
          <span className="inline-flex items-center gap-1 rounded-2xl bg-[var(--color-muted)] px-3 py-2"><Users size={14} /> Guests</span>
          <span className="inline-flex items-center gap-1 rounded-2xl bg-[var(--color-muted)] px-3 py-2"><CalendarDays size={14} /> Flexible</span>
        </div>
        {item.id ? (
          <form
            className="mt-5 grid gap-3 rounded-[1.3rem] bg-[var(--color-sand)]/60 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onBook?.({
                hotelId: item.id as string,
                checkIn: String(fd.get("checkIn")),
                checkOut: String(fd.get("checkOut")),
                guests: Number(fd.get("guests") || 1),
              });
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Check in" name="checkIn" type="date" defaultValue={defaultCheckIn} required />
              <Field label="Check out" name="checkOut" type="date" defaultValue={defaultCheckOut} required />
            </div>
            <Field label="Travellers" name="guests" type="number" min={1} defaultValue={1} required />
            <Button type="submit" disabled={bookingLoading} className="w-full">
              {bookingLoading ? <InlineLoading label="Booking..." /> : "Book now"}
            </Button>
            <Link href={`/hotels/${item.id}`} className="text-center text-sm font-extrabold text-[var(--color-teal)]">View full hotel page</Link>
          </form>
        ) : (
          <Button type="button" variant="secondary" className="mt-5 w-full">View details</Button>
        )}
      </div>
    </article>
  );
}
