"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Binoculars,
  Camera,
  Check,
  Compass,
  Crown,
  Hotel,
  Leaf,
  MapPin,
  Mountain,
  Palmtree,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Utensils,
  Waves,
} from "lucide-react";
import { InputField, Message } from "@/components/FormFields";
import { useAuth } from "@/context/AuthContext";

type PreferenceState = {
  interests: string[];
  travelStyles: string[];
  budgets: string[];
  preferredDistricts: string[];
  activityTypes: string[];
  accommodationTypes: string[];
  pace: string;
};

const INTERESTS = [
  { label: "Beaches", icon: Waves },
  { label: "Wildlife", icon: Binoculars },
  { label: "Culture", icon: Compass },
  { label: "Adventure", icon: Mountain },
  { label: "Food", icon: Utensils },
  { label: "Wellness", icon: Leaf },
  { label: "Photography", icon: Camera },
  { label: "Nightlife", icon: Sparkles },
];

const PLACES = [
  { label: "Coastal towns", hint: "Mirissa, Galle, Arugam Bay", icon: Waves },
  { label: "Mountains", hint: "Ella, Nuwara Eliya", icon: Mountain },
  { label: "National parks", hint: "Yala, Udawalawe", icon: Binoculars },
  { label: "Heritage cities", hint: "Sigiriya, Kandy, Anuradhapura", icon: Compass },
  { label: "Tea plantations", hint: "Nuwara Eliya, Haputale", icon: Leaf },
  { label: "Waterfalls", hint: "Ella, Ratnapura", icon: Palmtree },
  { label: "Rural villages", hint: "Local community stays", icon: MapPin },
  { label: "Modern cities", hint: "Colombo, Negombo", icon: Hotel },
];

const ACTIVITY_GROUPS = [
  { title: "Adventure", items: ["Hiking", "Surfing", "Diving", "Cycling"] },
  { title: "Nature", items: ["Safari", "Whale watching", "Birdwatching", "Waterfall visits"] },
  { title: "Culture", items: ["Temple visits", "Historical tours", "Village experiences", "Cultural performances"] },
  { title: "Relaxation", items: ["Spa visits", "Beach days", "Scenic train rides", "Yoga"] },
  { title: "Food", items: ["Street food", "Cooking classes", "Tea tasting", "Seafood experiences"] },
];

const STAYS = [
  { label: "Boutique hotel", text: "Distinctive stays with character.", icon: Hotel },
  { label: "Beach resort", text: "Comfort beside the ocean.", icon: Waves },
  { label: "Villa", text: "Private and spacious accommodation.", icon: ShieldCheck },
  { label: "Eco-lodge", text: "Nature-focused and sustainable stays.", icon: Leaf },
  { label: "Homestay", text: "Local hospitality and cultural immersion.", icon: MapPin },
  { label: "Hostel", text: "Social and affordable accommodation.", icon: Compass },
  { label: "Luxury hotel", text: "Premium comfort and amenities.", icon: Crown },
];

const TRAVEL_STYLES = [
  { label: "The Explorer", text: "Loves discovering unfamiliar places." },
  { label: "The Relaxer", text: "Prioritizes comfort and downtime." },
  { label: "The Adventurer", text: "Looks for exciting outdoor experiences." },
  { label: "The Culture Seeker", text: "Enjoys heritage and local traditions." },
  { label: "The Food Lover", text: "Plans around memorable food experiences." },
  { label: "The Luxury Traveler", text: "Values premium stays and services." },
];

const BUDGETS = [
  { label: "budget-friendly", title: "Budget-friendly", text: "Smart value and simple stays." },
  { label: "mid-range", title: "Mid-range", text: "Comfort with good flexibility." },
  { label: "premium", title: "Premium", text: "Refined hotels and curated activities." },
  { label: "luxury", title: "Luxury", text: "Best stays, service, and private experiences." },
];

const PACES = [
  { label: "relaxed", title: "Relaxed", text: "Fewer destinations, more time in each place." },
  { label: "balanced", title: "Balanced", text: "A comfortable mix of activities and rest." },
  { label: "fast-paced", title: "Fast-paced", text: "More destinations and a fuller itinerary." },
];

export default function TouristRegisterPage() {
  const { register, updateTouristPreferences } = useAuth();
  const router = useRouter();
  const [stage, setStage] = useState<"account" | "taste" | "done">("account");
  const [question, setQuestion] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "Sri Lanka",
    terms: false,
  });
  const [preferences, setPreferences] = useState<PreferenceState>({
    interests: [],
    travelStyles: [],
    budgets: ["mid-range"],
    preferredDistricts: [],
    activityTypes: [],
    accommodationTypes: [],
    pace: "balanced",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => {
    let score = 0;
    if (form.password.length >= 6) score += 1;
    if (/[A-Z]/.test(form.password)) score += 1;
    if (/\d/.test(form.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
    return score;
  }, [form.password]);

  const selectedCount = useMemo(() => (
    preferences.interests.length +
    preferences.travelStyles.length +
    preferences.budgets.length +
    preferences.preferredDistricts.length +
    preferences.activityTypes.length +
    preferences.accommodationTypes.length +
    (preferences.pace ? 1 : 0)
  ), [preferences]);

  const validateAccount = () => {
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (!form.terms) return "Please accept the platform terms acknowledgement.";
    return "";
  };

  const createAccount = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validateAccount();
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        country: form.country,
        role: "tourist",
      });
      setStage("taste");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (preferences.interests.length === 0 || preferences.preferredDistricts.length === 0) {
      setError("Choose at least one interest and one preferred place.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateTouristPreferences(preferences);
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save preferences.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (question === 6) {
      void savePreferences();
      return;
    }
    setQuestion((current) => Math.min(6, current + 1));
  };

  return (
    <main className="min-h-screen bg-[var(--color-ivory)] pt-20">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
        <aside className="relative overflow-hidden rounded-[2rem] bg-[var(--color-midnight)] p-7 text-white shadow-[var(--shadow-lift)] lg:p-10">
          <div className="absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_25%_20%,rgba(217,164,65,0.35),transparent_34%),radial-gradient(circle_at_78%_10%,rgba(15,118,110,0.35),transparent_32%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              {stage === "account" ? (
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-amber-100">
                  <Sparkles size={14} /> Account setup
                </p>
              ) : null}
              <h1 className="mt-8 max-w-xl text-5xl font-black leading-[0.92] sm:text-6xl lg:text-7xl">Start your Sri Lankan adventure</h1>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/68">Create your account first. Then we ask one travel-taste question at a time and save your answers for personalized recommendations.</p>
            </div>
            <ProfilePreview stage={stage} question={question} selectedCount={selectedCount} preferences={preferences} />
          </div>
        </aside>

        <section className="grid place-items-center">
          {stage === "account" ? (
            <AccountStep
              form={form}
              strength={strength}
              error={error}
              loading={loading}
              setForm={setForm}
              onSubmit={createAccount}
            />
          ) : null}

          {stage === "taste" ? (
            <TasteStep
              question={question}
              preferences={preferences}
              error={error}
              loading={loading}
              setQuestion={setQuestion}
              setPreferences={setPreferences}
              onNext={nextQuestion}
            />
          ) : null}

          {stage === "done" ? (
            <DoneStep onContinue={() => router.push("/dashboard")} />
          ) : null}
        </section>
      </section>
    </main>
  );
}

function AccountStep({
  form,
  strength,
  error,
  loading,
  setForm,
  onSubmit,
}: {
  form: { name: string; email: string; password: string; confirmPassword: string; phone: string; country: string; terms: boolean };
  strength: number;
  error: string;
  loading: boolean;
  setForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; password: string; confirmPassword: string; phone: string; country: string; terms: boolean }>>;
  onSubmit: (event: FormEvent) => void;
}) {
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 shadow-[var(--shadow-lift)] backdrop-blur">
      <Header eyebrow="Step 1 of 2" title="Account registration" text="Your tourist account activates immediately. Travel taste questions come after this step." progress={45} />
      <form onSubmit={onSubmit} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
        <InputField label="Full name" required placeholder="Yasiru Nisal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <InputField label="Email address" type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <InputField label="Phone number" required placeholder="+94 77 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <InputField label="Country" required placeholder="Germany" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <div>
          <InputField label="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-[var(--color-teal)] transition-all" style={{ width: `${strength * 25}%` }} /></div>
          <p className="mt-1 text-xs text-slate-500">Use 6+ characters. Uppercase, number, and symbol improve strength.</p>
        </div>
        <div>
          <InputField label="Confirm password" type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          {passwordsMatch ? <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-teal)]"><Check size={13} /> Passwords match</p> : null}
        </div>
        <label className="flex gap-3 rounded-2xl bg-[var(--color-sand)]/70 p-4 text-sm leading-6 text-slate-700 lg:col-span-2">
          <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} className="mt-1 size-4" />
          <span>I accept the terms and privacy acknowledgement, and understand booking requests use provider confirmation rules.</span>
        </label>
        {error ? <div className="lg:col-span-2"><Message type="error" text={error} /></div> : null}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          <p className="text-sm text-slate-600">Already registered? <Link href="/login" className="font-extrabold text-[var(--color-teal)]">Login</Link></p>
          <button disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-teal)] px-5 text-sm font-extrabold text-white hover:bg-[#0b615b] disabled:opacity-60">
            {loading ? "Creating..." : "Create account"} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

function TasteStep({
  question,
  preferences,
  error,
  loading,
  setQuestion,
  setPreferences,
  onNext,
}: {
  question: number;
  preferences: PreferenceState;
  error: string;
  loading: boolean;
  setQuestion: React.Dispatch<React.SetStateAction<number>>;
  setPreferences: React.Dispatch<React.SetStateAction<PreferenceState>>;
  onNext: () => void;
}) {
  const title = [
    "What inspires your trips?",
    "Where do you feel most alive?",
    "What would you love to do?",
    "Where would you like to stay?",
    "Which traveler sounds most like you?",
    "What feels comfortable for your trip?",
    "How do you like to explore?",
  ][question];

  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 shadow-[var(--shadow-lift)] backdrop-blur">
      <Header eyebrow={`Travel Taste ${question + 1} of 7`} title={title} text="Answer one question at a time. You can update these preferences later from your profile." progress={50 + ((question + 1) / 7) * 50} />
      <div className="p-5 sm:p-6">
        {question === 0 ? <IconGrid items={INTERESTS} selected={preferences.interests} onToggle={(value) => setPreferences((current) => ({ ...current, interests: toggleValue(current.interests, value) }))} /> : null}
        {question === 1 ? <PlaceGrid selected={preferences.preferredDistricts} onToggle={(value) => setPreferences((current) => ({ ...current, preferredDistricts: toggleValue(current.preferredDistricts, value) }))} /> : null}
        {question === 2 ? <ActivityGroups selected={preferences.activityTypes} onToggle={(value) => setPreferences((current) => ({ ...current, activityTypes: toggleValue(current.activityTypes, value) }))} /> : null}
        {question === 3 ? <StayGrid selected={preferences.accommodationTypes} onToggle={(value) => setPreferences((current) => ({ ...current, accommodationTypes: toggleValue(current.accommodationTypes, value) }))} /> : null}
        {question === 4 ? <TextCardGrid items={TRAVEL_STYLES} selected={preferences.travelStyles[0] || ""} onSelect={(value) => setPreferences((current) => ({ ...current, travelStyles: [value] }))} /> : null}
        {question === 5 ? <TextCardGrid items={BUDGETS} selected={preferences.budgets[0] || ""} onSelect={(value) => setPreferences((current) => ({ ...current, budgets: [value] }))} /> : null}
        {question === 6 ? <TextCardGrid items={PACES} selected={preferences.pace} onSelect={(value) => setPreferences((current) => ({ ...current, pace: value }))} /> : null}

        {error ? <div className="mt-5"><Message type="error" text={error} /></div> : null}
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" disabled={question === 0 || loading} onClick={() => setQuestion((current) => Math.max(0, current - 1))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(12,59,53,0.16)] bg-white px-5 text-sm font-extrabold text-[var(--color-forest)] disabled:opacity-45">
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" onClick={onNext} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-teal)] px-5 text-sm font-extrabold text-white hover:bg-[#0b615b] disabled:opacity-60">
            {question === 6 ? (loading ? "Saving..." : "Finish onboarding") : "Next question"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DoneStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="w-full rounded-[2rem] border border-white/70 bg-white/92 p-8 text-center shadow-[var(--shadow-lift)] backdrop-blur">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-[rgba(15,118,110,0.1)] text-[var(--color-teal)]">
        <PartyPopper size={28} />
      </div>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-teal)]">Congratulations</p>
      <h2 className="mx-auto mt-3 max-w-2xl text-5xl font-black leading-none text-[var(--color-midnight)]">Your account was created successfully.</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">Your travel taste has been saved. JourniQ AI sent a verification email too, so your recommendations, bookings, and trip planning stay connected to a trusted profile.</p>
      <button onClick={onContinue} className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-teal)] px-6 text-sm font-extrabold text-white hover:bg-[#0b615b]">
        Open my profile <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Header({ eyebrow, title, text, progress }: { eyebrow: string; title: string; text: string; progress: number }) {
  return (
    <div className="border-b border-[rgba(12,59,53,0.1)] bg-white p-5 sm:p-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-teal)]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-[var(--color-midnight)] sm:text-4xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{text}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[var(--color-teal)] transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
      </div>
    </div>
  );
}

function ProfilePreview({ stage, question, selectedCount, preferences }: { stage: string; question: number; selectedCount: number; preferences: PreferenceState }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-200">Traveler profile preview</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniStat label="Stage" value={stage === "done" ? "Finished" : stage === "taste" ? `Q${question + 1}/7` : "Account"} />
        <MiniStat label="Signals" value={String(selectedCount)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[...preferences.interests, ...preferences.preferredDistricts, ...preferences.travelStyles, ...preferences.budgets, preferences.pace].filter(Boolean).slice(0, 8).map((item) => (
          <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/75">{item}</span>
        ))}
        {selectedCount === 0 ? <p className="text-sm leading-6 text-white/55">Your selections will appear here as you answer each question.</p> : null}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">{label}</p>
    </div>
  );
}

function IconGrid({ items, selected, onToggle }: { items: typeof INTERESTS; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const active = selected.includes(item.label);
        return <ChoiceCard key={item.label} active={active} title={item.label} icon={<Icon size={20} />} onClick={() => onToggle(item.label)} />;
      })}
    </div>
  );
}

function PlaceGrid({ selected, onToggle }: { selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {PLACES.map((item) => {
        const Icon = item.icon;
        const active = selected.includes(item.label);
        return <ChoiceCard key={item.label} active={active} title={item.label} text={item.hint} icon={<Icon size={20} />} onClick={() => onToggle(item.label)} />;
      })}
    </div>
  );
}

function ActivityGroups({ selected, onToggle }: { selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {ACTIVITY_GROUPS.map((group) => (
        <section key={group.title} className="rounded-[1.5rem] border border-[rgba(12,59,53,0.1)] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-black text-[var(--color-midnight)]">{group.title}</h3>
            <span className="rounded-full bg-[var(--color-muted)] px-2.5 py-1 text-xs font-black text-[var(--color-teal)]">{group.items.filter((item) => selected.includes(item)).length}/{group.items.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => {
              const active = selected.includes(item);
              return (
                <button key={item} type="button" onClick={() => onToggle(item)} aria-pressed={active} className={`min-h-10 rounded-full px-3 text-xs font-extrabold transition ${active ? "bg-[var(--color-teal)] text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-50"}`}>
                  {item}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function StayGrid({ selected, onToggle }: { selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {STAYS.map((item) => {
        const Icon = item.icon;
        const active = selected.includes(item.label);
        return <ChoiceCard key={item.label} active={active} title={item.label} text={item.text} icon={<Icon size={20} />} onClick={() => onToggle(item.label)} />;
      })}
    </div>
  );
}

function TextCardGrid({ items, selected, onSelect }: { items: Array<{ label: string; title?: string; text: string }>; selected: string; onSelect: (value: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const active = selected === item.label;
        return (
          <button key={item.label} type="button" onClick={() => onSelect(item.label)} aria-pressed={active} className={`min-h-32 rounded-[1.5rem] border p-4 text-left transition ${active ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white shadow-[var(--shadow-soft)]" : "border-[rgba(12,59,53,0.1)] bg-white text-slate-700 hover:border-[var(--color-teal)]"}`}>
            <span className={`grid size-8 place-items-center rounded-full ${active ? "bg-white text-[var(--color-teal)]" : "bg-[var(--color-muted)] text-transparent"}`}><Check size={15} /></span>
            <span className="mt-4 block text-base font-black leading-tight">{item.title || item.label}</span>
            <span className={`mt-2 block text-sm leading-6 ${active ? "text-white/75" : "text-slate-500"}`}>{item.text}</span>
          </button>
        );
      })}
    </div>
  );
}

function ChoiceCard({ active, title, text, icon, onClick }: { active: boolean; title: string; text?: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`min-h-32 rounded-[1.5rem] border p-4 text-left transition ${active ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white shadow-[var(--shadow-soft)]" : "border-[rgba(12,59,53,0.1)] bg-white text-slate-700 hover:border-[var(--color-teal)]"}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-11 place-items-center rounded-2xl ${active ? "bg-white text-[var(--color-teal)]" : "bg-[var(--color-muted)] text-[var(--color-teal)]"}`}>{icon}</span>
        <span className={`grid size-7 place-items-center rounded-full ${active ? "bg-white text-[var(--color-teal)]" : "bg-slate-100 text-transparent"}`}><Check size={14} /></span>
      </div>
      <span className="mt-4 block text-base font-black leading-tight">{title}</span>
      {text ? <span className={`mt-2 block text-xs leading-5 ${active ? "text-white/75" : "text-slate-500"}`}>{text}</span> : null}
    </button>
  );
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
