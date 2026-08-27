"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl text-emerald-950">Settings</h1>
      <section className="rounded-2xl border border-emerald-100 bg-white p-6">
        <h2 className="text-lg text-emerald-950">Profile Settings</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2"><input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Owner name" defaultValue="Saman Perera" /><input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Business email" defaultValue="owner@emeraldlagoon.lk" /></div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6">
        <h2 className="text-lg text-emerald-950">Password Update</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3"><input type="password" className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Current password" /><input type="password" className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="New password" /><input type="password" className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Confirm password" /></div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6">
        <h2 className="text-lg text-emerald-950">Notification Preferences</h2>
        <div className="mt-4 space-y-3 text-sm text-emerald-900"><label className="flex items-center gap-2"><input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} /> Email notifications</label><label className="flex items-center gap-2"><input type="checkbox" checked={smsNotifs} onChange={(e) => setSmsNotifs(e.target.checked)} /> SMS notifications</label></div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6">
        <h2 className="text-lg text-emerald-950">Business Verification</h2>
        <p className="mt-2 text-sm text-emerald-900/80">Status: <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">approved</span></p>
      </section>
    </div>
  );
}
