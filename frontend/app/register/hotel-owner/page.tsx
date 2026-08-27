"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BedDouble, Building2, Hotel, MailCheck, ShieldCheck } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { InputField, Message } from "@/components/FormFields";
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
  });

  const completed = useMemo(() => Object.values(form).filter(Boolean).length, [form]);
  const progress = Math.round((completed / Object.keys(form).length) * 100);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
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
    >
      <div className="mb-5 rounded-[1.5rem] border border-[rgba(12,59,53,0.1)] bg-[var(--color-muted)] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal)]">Application progress</p>
          <p className="text-sm font-black text-[var(--color-midnight)]">{progress}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-[var(--color-gold)] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="rounded-[1.6rem] border border-[rgba(12,59,53,0.1)] bg-white/75 p-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-midnight)]">
            <BadgeCheck size={17} /> Owner access
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Owner name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <InputField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <InputField label="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <InputField label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-[rgba(12,59,53,0.1)] bg-white/75 p-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-midnight)]">
            <Building2 size={17} /> Hotel identity
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Country" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <InputField label="District" required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            <InputField label="Hotel / business name" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            <InputField label="Business registration no." required value={form.businessRegistrationNumber} onChange={(e) => setForm({ ...form, businessRegistrationNumber: e.target.value })} />
          </div>
        </section>

        <div className="grid gap-3 rounded-[1.5rem] bg-[var(--color-midnight)] p-4 text-sm text-white/72">
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
