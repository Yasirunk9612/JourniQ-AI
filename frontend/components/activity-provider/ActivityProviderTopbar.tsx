"use client";

import { Bell, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ActivityProviderTopbar() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const onLogout = async () => { await logout(); router.push("/login/activity-provider"); };

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" /><input className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-amber-200" placeholder="Search experiences, bookings..." /></div>
        <div className="flex items-center gap-3"><button className="rounded-lg border border-emerald-200 p-2 text-emerald-700"><Bell size={18} /></button><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-emerald-950">{user?.name || "Provider"}</p><p className="text-xs text-emerald-700">Activity Provider</p></div><button onClick={onLogout} className="inline-flex items-center gap-1 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white"><LogOut size={14} /> Logout</button></div>
      </div>
    </header>
  );
}
