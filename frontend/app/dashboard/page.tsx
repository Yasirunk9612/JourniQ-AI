"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Compass, Database, Hotel, LogOut, MessageCircle, Save, Sparkles, Trash2, UserRound } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicNavbar from "@/components/public/PublicNavbar";
import SiteFooter from "@/components/public/SiteFooter";
import { Badge, ButtonLink } from "@/components/public/TouristUI";
import { Message } from "@/components/FormFields";
import { useAuth } from "@/context/AuthContext";

export default function TouristProfilePage() {
  const { user, logout, updateProfile, updateTouristPreferences, deleteAccount } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", phone: "", country: "", profileImage: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return undefined;
    const id = window.setTimeout(() => {
      setProfile({ name: user.name || "", phone: user.phone || "", country: user.country || "", profileImage: user.profileImage || "" });
    }, 0);
    return () => window.clearTimeout(id);
  }, [user]);

  const preferences = user?.touristPreferences;
  const behavior = user?.touristBehavior;
  const preferenceChips = useMemo(() => [
    ...(preferences?.interests || []),
    ...(preferences?.preferredDistricts || []),
    ...(preferences?.activityTypes || []),
    ...(preferences?.accommodationTypes || []),
    ...(preferences?.travelStyles || []),
    ...(preferences?.budgets || []),
    preferences?.pace || "",
  ].filter(Boolean), [preferences]);
  const completeness = Math.min(100, Math.round((preferenceChips.length / 10) * 100));
  const initials = (user?.name || "Traveller").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateProfile(profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const clearPreferences = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateTouristPreferences({ interests: [], preferredDistricts: [], activityTypes: [], accommodationTypes: [], travelStyles: [], budgets: [], pace: "" });
      setMessage("Travel preferences cleared.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear preferences.");
    } finally {
      setSaving(false);
    }
  };

  const removeAccount = async () => {
    const confirmed = window.confirm("Delete your tourist account permanently? This cannot be undone.");
    if (!confirmed) return;
    setDeleting(true);
    setError("");
    try {
      await deleteAccount();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete account.");
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["tourist"]}>
      <PublicNavbar />
      <main className="min-h-screen bg-[var(--color-ivory)] pb-16 pt-24">
        <section className="tourist-container">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-[var(--color-midnight)] p-6 text-white shadow-[var(--shadow-lift)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,164,65,0.34),transparent_30%),radial-gradient(circle_at_86%_0%,rgba(15,118,110,0.42),transparent_34%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
              <div>
                <Badge tone="gold">Tourist profile</Badge>
                <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end">
                  <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 text-3xl font-black text-white">
                    {profile.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.profileImage} alt={`${user?.name || "Tourist"} profile`} className="h-full w-full object-cover" />
                    ) : initials}
                  </div>
                  <div>
                    <h1 className="text-5xl font-black leading-none md:text-7xl">{user?.name || "Traveller"}</h1>
                    <p className="mt-3 text-sm font-bold text-white/70">{user?.country || "Sri Lanka"} traveler • {user?.email}</p>
                  </div>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-white/68">Manage your account, preferences, AI profile, messages, and the data JourniQ uses to personalize travel recommendations.</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-100">Profile readiness</p>
                <p className="mt-3 text-5xl font-black">{completeness}%</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-amber-300" style={{ width: `${completeness}%` }} /></div>
                <button onClick={logout} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/18 px-5 py-2.5 text-sm font-bold text-white"><LogOut size={16} /> Logout</button>
              </div>
            </div>
          </div>
        </section>

        <section className="tourist-container mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Action href="/dashboard/ai-profile" icon={<Brain />} label="AI profile" tone="dark" />
          <Action href="/dashboard/messages" icon={<MessageCircle />} label="Messages" tone="teal" />
          <Action href="/recommendations" icon={<Sparkles />} label="Recommendations" tone="coral" />
          <Action href="/hotels" icon={<Hotel />} label="Hotels" tone="light" />
          <Action href="/experiences" icon={<Compass />} label="Experiences" tone="light" />
        </section>

        <section className="tourist-container mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={saveProfile} className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal)]">Account details</p>
                <h2 className="mt-2 text-4xl font-black leading-none text-[var(--color-midnight)]">Edit profile</h2>
              </div>
              <UserRound className="text-[var(--color-teal)]" />
            </div>
            <div className="mt-6 grid gap-4">
              <ProfileField label="Full name" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} />
              <ProfileField label="Phone" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
              <ProfileField label="Country" value={profile.country} onChange={(value) => setProfile({ ...profile, country: value })} />
              <ProfileField label="Profile image URL" value={profile.profileImage} onChange={(value) => setProfile({ ...profile, profileImage: value })} />
            </div>
            {message ? <div className="mt-5"><Message type="success" text={message} /></div> : null}
            {error ? <div className="mt-5"><Message type="error" text={error} /></div> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-teal)] px-5 text-sm font-extrabold text-white disabled:opacity-60"><Save size={16} /> {saving ? "Saving..." : "Save changes"}</button>
              <button type="button" disabled={deleting} onClick={removeAccount} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-50 px-5 text-sm font-extrabold text-red-700 disabled:opacity-60"><Trash2 size={16} /> {deleting ? "Deleting..." : "Delete account"}</button>
            </div>
          </form>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal)]">Preference memory</p>
                  <h2 className="mt-2 text-4xl font-black leading-none text-[var(--color-midnight)]">Saved travel taste</h2>
                </div>
                <Sparkles className="text-[var(--color-teal)]" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {preferenceChips.map((chip) => <Badge key={chip} tone="teal">{chip}</Badge>)}
                {preferenceChips.length === 0 ? <p className="text-sm text-slate-500">No travel preferences saved yet.</p> : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/dashboard/ai-profile" variant="secondary">Open AI profile</ButtonLink>
                <button type="button" onClick={clearPreferences} disabled={saving} className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-100 bg-red-50 px-5 text-sm font-extrabold text-red-700 disabled:opacity-60">Clear preferences</button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal)]">Behavior history</p>
                  <h2 className="mt-2 text-4xl font-black leading-none text-[var(--color-midnight)]">Past data</h2>
                </div>
                <Database className="text-[var(--color-teal)]" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DataTile label="Hotel bookings" value={String(behavior?.hotelBookings || 0)} />
                <DataTile label="Experience bookings" value={String(behavior?.experienceBookings || 0)} />
                <DataTile label="Districts" value={String(behavior?.lastBookedDistricts?.length || 0)} />
                <DataTile label="Categories" value={String(behavior?.lastBookedCategories?.length || 0)} />
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <PastList title="Last booked districts" items={behavior?.lastBookedDistricts || []} />
                <PastList title="Last booked categories" items={behavior?.lastBookedCategories || []} />
              </div>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </ProtectedRoute>
  );
}

function Action({ href, icon, label, tone }: { href: string; icon: React.ReactNode; label: string; tone: "dark" | "teal" | "coral" | "light" }) {
  const tones = {
    dark: "bg-[var(--color-midnight)] text-white",
    teal: "bg-[var(--color-teal)] text-white",
    coral: "bg-[var(--color-coral)] text-white",
    light: "bg-white/90 text-[var(--color-forest)] border border-white/70",
  };
  return <ButtonLink href={href} className={`justify-start rounded-[1.5rem] p-5 ${tones[tone]}`} variant="ghost">{icon}{label}</ButtonLink>;
}

function ProfileField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-forest)]/75">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="min-h-12 w-full rounded-2xl border border-[rgba(12,59,53,0.16)] bg-white px-4 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[rgba(217,164,65,0.18)]" /></label>;
}

function DataTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[var(--color-muted)] p-4"><p className="text-3xl font-black text-[var(--color-midnight)]">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p></div>;
}

function PastList({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl border border-[rgba(12,59,53,0.1)] p-4"><p className="text-sm font-black text-[var(--color-midnight)]">{title}</p><div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <Badge key={item} tone="dark">{item}</Badge>)}{items.length === 0 ? <p className="text-sm text-slate-500">No data yet.</p> : null}</div></div>;
}
