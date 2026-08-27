"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarDays, Compass, MailCheck, MapPinned, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { InputField, Message } from "@/components/FormFields";
import { useAuth } from "@/context/AuthContext";

const categoryIdeas = ["Culture", "Village life", "Food", "Wildlife", "Hiking", "Surfing", "Water sports", "Wellness", "Adventure"];

export default function ActivityProviderRegisterPage() {
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
    activityCategory: "",
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
      const result = await register({ ...form, role: "activity_provider" });
      setSuccess(`${result.message} Check your email for the application confirmation.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Local experience partner"
      title="Turn authentic moments into bookable journeys."
      subtitle="Apply to share cultural, food, nature, wellness, festival, or adventure experiences with travelers through JourniQ AI."
      panelTitle="Activity provider application"
      panelSubtitle="Tell us who manages the experience and what kind of local activity you offer."
      icon={Compass}
      accent="coral"
    >
      <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-[rgba(12,59,53,0.1)] bg-white">
        <div className="flex items-center justify-between gap-3 bg-[var(--color-midnight)] p-4 text-white">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-amber-100"><Sparkles size={15} /> Provider readiness</p>
          <p className="text-sm font-black">{progress}%</p>
        </div>
        <div className="h-2 bg-[var(--color-muted)]">
          <div className="h-full rounded-r-full bg-[var(--color-coral)] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="rounded-[1.6rem] border border-[rgba(12,59,53,0.1)] bg-white/75 p-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-midnight)]">
            <BadgeCheck size={17} /> Manager access
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Contact name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <InputField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <InputField label="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <InputField label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-[rgba(12,59,53,0.1)] bg-white/75 p-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-midnight)]">
            <UsersRound size={17} /> Experience identity
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Country" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <InputField label="District" required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            <InputField label="Provider / business name" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            <InputField label="Main activity category" required value={form.activityCategory} onChange={(e) => setForm({ ...form, activityCategory: e.target.value })} list="activity-category-ideas" />
            <datalist id="activity-category-ideas">
              {categoryIdeas.map((category) => <option key={category} value={category} />)}
            </datalist>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categoryIdeas.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setForm({ ...form, activityCategory: category })}
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${
                  form.activityCategory === category
                    ? "border-[var(--color-coral)] bg-[rgba(255,107,74,0.12)] text-[var(--color-coral)]"
                    : "border-[rgba(12,59,53,0.12)] bg-white text-slate-600 hover:text-[var(--color-midnight)]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-3 rounded-[1.5rem] bg-[var(--color-midnight)] p-4 text-sm text-white/72">
          <p className="flex items-center gap-2"><MailCheck className="text-[var(--color-gold)]" size={17} /> Application confirmation is sent by email.</p>
          <p className="flex items-center gap-2"><ShieldCheck className="text-[var(--color-gold)]" size={17} /> Admin approval unlocks the provider dashboard.</p>
          <p className="flex items-center gap-2"><CalendarDays className="text-[var(--color-gold)]" size={17} /> After approval you manage dates, bookings, images, and messages.</p>
          <p className="flex items-center gap-2"><MapPinned className="text-[var(--color-gold)]" size={17} /> Clear district details help travelers find your experience.</p>
        </div>

        {error && <Message type="error" text={error} />}
        {success && <Message type="success" text={success} />}

        <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-coral)] px-4 py-3 font-extrabold text-white hover:bg-[#e85f42] disabled:opacity-60" disabled={loading}>
          {loading ? "Submitting application..." : "Submit experience application"} <ArrowRight size={17} />
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <Link href="/register" className="font-extrabold text-[var(--color-teal)]">Change account type</Link>
        <Link href="/login/activity-provider" className="font-extrabold text-[var(--color-teal)]">Already approved?</Link>
      </div>
    </AuthShell>
  );
}
