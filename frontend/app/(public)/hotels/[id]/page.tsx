"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, BedDouble, Check, MapPin, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { publicApi } from "@/lib/publicApi";
import { Hotel, PublicHotelRoom } from "@/lib/public-types";
import { Badge, Button, EmptyState, ErrorState, Field, InlineLoading, LoadingSkeleton } from "@/components/public/TouristUI";
import ListingInquiryButton from "@/components/chat/ListingInquiryButton";
import { formatLkr, formatLkrPrice } from "@/lib/currency";
import { useAuth } from "@/context/AuthContext";

export default function PublicHotelDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<PublicHotelRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    setError("");
    try {
      const data = await publicApi.getHotel(params.id);
      setHotel(data.hotel);
      setRooms(data.rooms || []);
      setSelectedRoomId(data.rooms?.[0]?.id || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load hotel");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const gallery = useMemo(() => {
    const hotelImages = hotel?.images || [];
    const roomImages = rooms.flatMap((room) => room.images || []);
    const all = [hotel?.image, ...hotelImages, ...roomImages].filter(Boolean) as string[];
    return Array.from(new Set(all)).slice(0, 15);
  }, [hotel, rooms]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || rooms[0];

  const book = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hotel?.id) return;
    if (user?.role !== "tourist") {
      toast.error("Please login as a tourist to book.");
      router.push("/login");
      return;
    }
    const fd = new FormData(event.currentTarget);
    try {
      setBookingLoading(true);
      await publicApi.bookHotel({
        hotelId: hotel.id,
        roomId: selectedRoomId || undefined,
        checkIn: String(fd.get("checkIn")),
        checkOut: String(fd.get("checkOut")),
        guests: Number(fd.get("guests") || 1),
      });
      toast.success("Hotel booking request sent");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Booking failed";
      toast.error(message.includes("Access denied") || message.includes("Not authorized") ? "Please login as a tourist to book." : message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <main className="tourist-container pt-28"><LoadingSkeleton count={3} /></main>;
  }

  if (error) {
    return <main className="tourist-container pt-28"><ErrorState message={error} onRetry={load} /></main>;
  }

  if (!hotel) {
    return <main className="tourist-container pt-28"><EmptyState title="Hotel not found" description="This hotel may still be pending approval or unavailable." /></main>;
  }

  return (
    <main className="bg-[var(--color-ivory)] pb-20 pt-24">
      <section className="tourist-container">
        <Link href="/hotels" className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--color-teal)]"><ArrowLeft size={16} /> Back to hotels</Link>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <Badge tone="gold">{hotel.type}</Badge>
            <h1 className="mt-4 text-5xl font-extrabold leading-none text-[var(--color-midnight)] md:text-7xl">{hotel.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[var(--color-teal)]"><MapPin size={16} /> {hotel.address || hotel.district}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/90 p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-[#8a6117]"><Star size={16} /> {hotel.rating}</span>
              <span className="text-xl font-extrabold text-[var(--color-midnight)]">{formatLkrPrice(hotel.price)}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{hotel.rooms} available rooms shown from active room inventory.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4 md:grid-rows-2">
          {(gallery.length ? gallery : [""]).slice(0, 5).map((src, index) => (
            <div key={`${src}-${index}`} className={`relative min-h-44 overflow-hidden rounded-[1.5rem] bg-[var(--color-muted)] ${index === 0 ? "md:col-span-2 md:row-span-2 md:min-h-[420px]" : ""}`}>
              {src ? <Image src={src} alt={`${hotel.name} gallery image ${index + 1}`} fill sizes={index === 0 ? "50vw" : "25vw"} className="object-cover" /> : null}
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { label: "Approved hotel", text: "Visible only after platform approval.", icon: ShieldCheck },
            { label: "Room-led booking", text: "Choose room specialties before sending a request.", icon: BedDouble },
            { label: "Direct inquiry", text: "Ask the owner from the listing context.", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="journiq-hover-lift rounded-[1.35rem] bg-white/88 p-5 shadow-[var(--shadow-soft)]">
                <Icon className="text-[var(--color-teal)]" />
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
            <h2 className="text-4xl font-extrabold text-[var(--color-midnight)]">About this stay</h2>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">{hotel.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {(hotel.facilities || []).map((facility) => <Badge key={facility} tone="teal">{facility}</Badge>)}
            </div>
          </article>

          <article className="rounded-[1.75rem] bg-white/90 p-7 shadow-[var(--shadow-soft)]">
            <h2 className="text-4xl font-extrabold text-[var(--color-midnight)]">Rooms and specialties</h2>
            <div className="mt-6 grid gap-5">
              {rooms.map((room) => (
                <button key={room.id} onClick={() => setSelectedRoomId(room.id)} className={`rounded-[1.5rem] border p-4 text-left transition ${selectedRoomId === room.id ? "border-[var(--color-teal)] bg-[rgba(15,118,110,0.08)]" : "border-[rgba(12,59,53,0.12)] bg-white"}`}>
                  <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                    <div className="relative h-36 overflow-hidden rounded-[1.1rem] bg-[var(--color-muted)]">
                      {room.images?.[0] ? <Image src={room.images[0]} alt={room.roomType} fill sizes="180px" className="object-cover" /> : null}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-2xl font-extrabold text-[var(--color-midnight)]">{room.roomType}</h3>
                        <p className="font-extrabold text-[var(--color-midnight)]">{formatLkr(room.pricePerNight)} / night</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{room.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-muted)] px-3 py-1.5"><Users size={13} /> {room.capacity} guests</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-muted)] px-3 py-1.5"><BedDouble size={13} /> {room.availableRooms} available</span>
                        {room.amenities.map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-muted)] px-3 py-1.5"><Check size={13} /> {item}</span>)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </article>
        </div>

        <aside className="h-fit rounded-[1.75rem] bg-[var(--color-midnight)] p-5 text-white shadow-[var(--shadow-lift)] lg:sticky lg:top-24">
          <h2 className="text-3xl font-extrabold">Request booking</h2>
          <p className="mt-2 text-sm leading-6 text-white/66">Final room allocation and payment must be confirmed by the provider/backend workflow.</p>
          <form onSubmit={book} className="mt-5 grid gap-4">
            <label className="block text-sm font-bold">Selected room
              <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-white">
                {rooms.map((room) => <option key={room.id} value={room.id} className="text-slate-900">{room.roomType}</option>)}
              </select>
            </label>
            <Field inverted label="Check in" name="checkIn" type="date" required />
            <Field inverted label="Check out" name="checkOut" type="date" required />
            <Field inverted label="Guests" name="guests" type="number" min={1} max={selectedRoom?.capacity || 20} defaultValue={1} required />
            <Button type="submit" disabled={bookingLoading} variant="coral" className="w-full">{bookingLoading ? <InlineLoading label="Booking..." /> : user?.role !== "tourist" ? "Login to request booking" : "Send booking request"}</Button>
          </form>
          {hotel.id ? <div className="mt-3">
            <ListingInquiryButton contextType="hotel" contextId={hotel.id} listingName={hotel.name} />
          </div> : null}
        </aside>
      </section>
    </main>
  );
}
