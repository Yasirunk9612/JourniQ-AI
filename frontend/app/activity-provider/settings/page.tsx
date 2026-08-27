"use client";

import { useState } from "react";

export default function ActivityProviderSettingsPage() {
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl text-emerald-950">Settings</h1>
      <section className="rounded-2xl border border-emerald-100 bg-white p-6"><h2 className="text-lg text-emerald-950">Account Settings</h2><div className="mt-3 grid gap-3 md:grid-cols-2"><input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Name" /><input className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Email" /></div></section>
      <section className="rounded-2xl border border-emerald-100 bg-white p-6"><h2 className="text-lg text-emerald-950">Password Update</h2><div className="mt-3 grid gap-3 md:grid-cols-3"><input type="password" className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Current" /><input type="password" className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="New" /><input type="password" className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Confirm" /></div></section>
      <section className="rounded-2xl border border-emerald-100 bg-white p-6"><h2 className="text-lg text-emerald-950">Notifications</h2><label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} /> Email notifications</label><label className="mt-2 flex items-center gap-2"><input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} /> SMS notifications</label></section>
      <section className="rounded-2xl border border-emerald-100 bg-white p-6"><h2 className="text-lg text-emerald-950">Verification Status</h2><span className="mt-3 inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">approved</span></section>
    </div>
  );
}
