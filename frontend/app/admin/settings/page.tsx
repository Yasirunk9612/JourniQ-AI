"use client";

import { useForm } from "react-hook-form";

type Values = { commissionPercent: number; adminName: string; email: string; alerts: boolean };

export default function AdminSettingsPage() {
  const { register, handleSubmit } = useForm<Values>({ defaultValues: { commissionPercent: 3, adminName: "Platform Admin", email: "admin@journiq.ai", alerts: true } });
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Admin Settings</h1><form onSubmit={handleSubmit(() => undefined)} className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-4 md:grid-cols-2"><label className="grid gap-1 text-sm">Commission %<input type="number" step="0.1" {...register("commissionPercent", { valueAsNumber: true })} className="rounded-xl border border-emerald-200 px-3 py-2" /></label><label className="grid gap-1 text-sm">Admin Name<input {...register("adminName")} className="rounded-xl border border-emerald-200 px-3 py-2" /></label><label className="grid gap-1 text-sm">Admin Email<input type="email" {...register("email")} className="rounded-xl border border-emerald-200 px-3 py-2" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("alerts")} />Notification alerts enabled</label><button className="rounded-xl bg-emerald-800 px-4 py-2 text-white md:col-span-2 md:w-fit">Save Settings</button></form></div>;
}
