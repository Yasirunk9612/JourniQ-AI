"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BedDouble, Building2, CheckCircle2, Hotel, MailCheck, MapPinned, ShieldCheck } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { InputField, Message } from "@/components/FormFields";
import MapPicker from "@/components/MapPicker";
import { useAuth } from "@/context/AuthContext";

export default function HotelOwnerRegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "Sri Lanka",
    businessName: "",
    businessRegistrationNumber: "",
    district: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const completed = useMemo(() => Object.values(form).filter(Boolean).length, [form]);
  const progress = Math.round((completed / Object.keys(form).length) * 100);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!form.latitude || !form.longitude) {
        setError("Please select the hotel location pin on the map.");
        setLoading(false);
        return;
      }
      const result = await register({ ...form, role: "hotel_owner" });
      setSuccess(`${result.message} Check your email for the application confirmation.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Verified hotel partner"
      title="List your Sri Lankan stay beautifully."
      subtitle="Apply once, receive email confirmation, then manage hotel profile, rooms, images, bookings, and revenue after admin approval."
      panelTitle="Hotel owner application"
      panelSubtitle="Complete the business details exactly as you want the admin team to review them."
      icon={Hotel}
      accent="gold"
      wide
    >
      <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-[rgba(12,59,53,0.1)] bg-[var(--color-midnight)] text-white">
        <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-gold)]">Partner onboarding</p>
            <h3 className="mt-2 text-2xl font-black leading-none">Verify the stay, pin the place, then submit.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">Admin reviewers see your business details and selected map pin before approval.</p>
          </div>
          <div className="min-w-40 rounded-[1.25rem] bg-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/58">Complete</span>
              <strong>{progress}%</strong>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[var(--color-gold)] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <div className="grid border-t border-white/10 md:grid-cols-3">
          {["Owner access", "Hotel identity", "Map pin"].map((item, index) => (
            <div key={item} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-white/72">
              <span className="grid size-7 place-items-center rounded-full bg-white text-xs font-black text-[var(--color-midnight)]">{index + 1}</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-[1.6rem] border border-[rgba(12,59,53,0.1)] bg-white/80 p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-midnight)]">
              <BadgeCheck size={17} /> Owner access
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <InputField label="Owner name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <InputField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <InputField label="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <InputField label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-[rgba(12,59,53,0.1)] bg-white/80 p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-midnight)]">
              <Building2 size={17} /> Hotel identity
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <InputField label="Country" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              <InputField label="District" required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
              <InputField label="Hotel / business name" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              <InputField label="Business registration no." required value={form.businessRegistrationNumber} onChange={(e) => setForm({ ...form, businessRegistrationNumber: e.target.value })} />
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-[1.8rem] border border-[rgba(12,59,53,0.1)] bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="bg-[var(--color-muted)] p-5">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-midnight)]">
                <MapPinned size={17} /> Hotel map location
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Add the address, then zoom and place the pin exactly where guests should arrive.</p>
              <div className="mt-5">
                <InputField label="Hotel address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, town, district" />
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <p className="flex items-center gap-2"><CheckCircle2 className="text-[var(--color-teal)]" size={17} /> Drag and zoom the map.</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="text-[var(--color-teal)]" size={17} /> Click to place or move the pin.</p>
              </div>
            </div>
            <div className="p-4">
              <MapPicker title="Select hotel pin" latitude={form.latitude} longitude={form.longitude} onChange={(coords) => setForm({ ...form, ...coords })} />
            </div>
          </div>
        </section>

        <div className="grid gap-3 rounded-[1.5rem] bg-[var(--color-midnight)] p-4 text-sm text-white/72 md:grid-cols-3">
          <p className="flex items-center gap-2"><MailCheck className="text-[var(--color-gold)]" size={17} /> You receive an application email after submission.</p>
          <p className="flex items-center gap-2"><ShieldCheck className="text-[var(--color-gold)]" size={17} /> Admin approval is required before hotel dashboard access.</p>
          <p className="flex items-center gap-2"><BedDouble className="text-[var(--color-gold)]" size={17} /> Rooms, amenities, galleries, and bookings are managed after approval.</p>
        </div>

        {error && <Message type="error" text={error} />}
        {success && <Message type="success" text={success} />}

        <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-teal)] px-4 py-3 font-extrabold text-white hover:bg-[#0b615b] disabled:opacity-60" disabled={loading}>
          {loading ? "Submitting application..." : "Submit hotel application"} <ArrowRight size={17} />
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <Link href="/register" className="font-extrabold text-[var(--color-teal)]">Change account type</Link>
        <Link href="/login/hotel-owner" className="font-extrabold text-[var(--color-teal)]">Already approved?</Link>
      </div>
    </AuthShell>
  );
}
