"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Compass, Hotel, MapPinned, Route, Sparkles, WalletCards } from "lucide-react";
import HeroSection from "@/components/public/HeroSection";
import SectionHeader from "@/components/public/SectionHeader";
import { Badge, Button, Field, SelectField, TextArea } from "@/components/public/TouristUI";
import { publicApi } from "@/lib/publicApi";

const steps = [
  "Destination",
  "Dates",
  "Travellers",
  "Budget",
  "Interests",
  "Pace",
  "Stay",
  "Activities",
  "Start",
  "Notes",
];

const sampleDays = [
  { title: "Day 1: Colombo soft landing", morning: "Arrive, check in, recover slowly.", afternoon: "Explore Galle Face and heritage streets.", evening: "Dinner near the coast." },
  { title: "Day 2: Cultural triangle", morning: "Travel toward Sigiriya.", afternoon: "Rock fortress or village experience.", evening: "Quiet stay near Dambulla." },
  { title: "Day 3: Hill country rhythm", morning: "Scenic transfer into tea country.", afternoon: "Tea estate walk and viewpoint.", evening: "Slow dinner in Ella." },
];

export default function AITripPlannerPage() {
  const [step, setStep] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [form, setForm] = useState({
    destination: "Sri Lanka",
    startDate: "",
    endDate: "",
    travellers: 2,
    budget: "mid-range",
    interests: "heritage, food, beaches",
    pace: "balanced",
    accommodation: "boutique hotel",
    activities: "village culture, hiking, wildlife",
    start: "Colombo",
    notes: "",
  });

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);
  const update = (key: keyof typeof form, value: string | number) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setGenerated(true);
    publicApi.trackTripPlanner(form).catch(() => {
      // Anonymous tourists can still preview plans; logged-in tourists get behavior tracking.
    });
  };

  const currentField = () => {
    switch (step) {
      case 0:
        return <Field label="Destination" value={form.destination} onChange={(e) => update("destination", e.target.value)} required />;
      case 1:
        return <div className="grid gap-4 sm:grid-cols-2"><Field label="Start date" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} /><Field label="End date" type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} /></div>;
      case 2:
        return <Field label="Travellers" type="number" min={1} value={form.travellers} onChange={(e) => update("travellers", Number(e.target.value))} />;
      case 3:
        return <SelectField label="Budget style" value={form.budget} onChange={(e) => update("budget", e.target.value)}><option>budget</option><option>mid-range</option><option>premium</option></SelectField>;
      case 4:
        return <TextArea label="Interests" value={form.interests} onChange={(e) => update("interests", e.target.value)} className="min-h-28" />;
      case 5:
        return <SelectField label="Travel pace" value={form.pace} onChange={(e) => update("pace", e.target.value)}><option>slow</option><option>balanced</option><option>active</option></SelectField>;
      case 6:
        return <SelectField label="Accommodation preference" value={form.accommodation} onChange={(e) => update("accommodation", e.target.value)}><option>boutique hotel</option><option>resort</option><option>guest house</option><option>villa</option></SelectField>;
      case 7:
        return <TextArea label="Preferred activities" value={form.activities} onChange={(e) => update("activities", e.target.value)} className="min-h-28" />;
      case 8:
        return <Field label="Starting location" value={form.start} onChange={(e) => update("start", e.target.value)} />;
      default:
        return <TextArea label="Additional requirements" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Accessibility, food preferences, children, special occasions..." className="min-h-32" />;
    }
  };

  return (
    <main>
      <HeroSection compact title="Build the trip around how you actually travel." subtitle="A multi-step AI planning interface. Until a live trip-generation API exists, it creates a transparent client-side itinerary preview and tracks planner behavior for logged-in tourists." image="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=85" eyebrow="Signature AI planner">
        <div className="grid max-w-4xl gap-3 sm:grid-cols-4">
          {[
            { label: "Dates", icon: CalendarDays },
            { label: "Budget", icon: WalletCards },
            { label: "Stay style", icon: Hotel },
            { label: "Activities", icon: Route },
          ].map((item) => {
            const Icon = item.icon;
            return <div key={item.label} className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm font-extrabold backdrop-blur"><Icon className="mb-2 text-[var(--color-gold)]" size={18} /> {item.label}</div>;
          })}
        </div>
      </HeroSection>

      <section className="tourist-container -mt-10 relative z-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="journiq-dark-panel rounded-[1.75rem] p-6 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--color-gold)]">Planner progress</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full bg-[var(--color-coral)]" style={{ width: `${progress}%` }} /></div>
          <div className="mt-6 grid gap-2">
            {steps.map((label, index) => <button key={label} onClick={() => setStep(index)} className={`rounded-2xl px-4 py-3 text-left text-sm font-bold ${index === step ? "bg-white text-[var(--color-midnight)]" : "bg-white/7 text-white/72"}`}>{index + 1}. {label}</button>)}
          </div>
        </aside>

        <form onSubmit={submit} className="journiq-panel journiq-orbit rounded-[1.75rem] p-6">
          <Badge tone="teal">Step {step + 1} of {steps.length}</Badge>
          <h2 className="mt-5 text-5xl leading-none text-[var(--color-midnight)]">{steps[step]}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Answer only what you know. The planner is designed to keep moving even when a tourist is still exploring.</p>
          <div className="mt-7">{currentField()}</div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((v) => Math.max(0, v - 1))}><ArrowLeft size={16} /> Back</Button>
            {step < steps.length - 1 ? <Button type="button" onClick={() => setStep((v) => Math.min(steps.length - 1, v + 1))}>Next <ArrowRight size={16} /></Button> : <Button type="submit" variant="coral"><Sparkles size={16} /> Generate preview</Button>}
          </div>
        </form>
      </section>

      <section className="tourist-container mt-12">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { title: "Start with the traveller", text: "The planner captures preference signals instead of asking for only dates and destination.", icon: Compass },
            { title: "Shape a route", text: "Pace, start location, budget, and activities give the itinerary a realistic Sri Lankan rhythm.", icon: MapPinned },
            { title: "Move into bookings", text: "Generated previews lead tourists into the live hotel and experience inventory.", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="journiq-hover-lift rounded-[1.5rem] bg-white/88 p-6 shadow-[var(--shadow-soft)]">
                <Icon className="text-[var(--color-teal)]" />
                <h3 className="mt-6 text-3xl leading-none text-[var(--color-midnight)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {generated ? (
        <section className="tourist-container mt-16">
          <SectionHeader eyebrow="Generated preview" title={`${form.pace} ${form.destination} itinerary`} description="This is a client-side itinerary preview. Booking actions route you to the live hotels and experiences pages." />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {sampleDays.map((day) => (
              <article key={day.title} className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-soft)]">
                <CalendarDays className="text-[var(--color-teal)]" />
                <h3 className="mt-5 text-3xl leading-none text-[var(--color-midnight)]">{day.title}</h3>
                <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-600">
                  <p><strong>Morning:</strong> {day.morning}</p>
                  <p><strong>Afternoon:</strong> {day.afternoon}</p>
                  <p><strong>Evening:</strong> {day.evening}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={() => setGenerated(false)} variant="secondary">Edit plan</Button>
            <Button type="button" onClick={() => window.location.assign("/hotels")}>Find hotels</Button>
            <Button type="button" onClick={() => window.location.assign("/experiences")} variant="coral">Book experiences</Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
