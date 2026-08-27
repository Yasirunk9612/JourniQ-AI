"use client";

import { Bell, LogOut, Search } from "lucide-react";

export default function AdminTopbar() {
  return (
    <header className="sticky top-0 z-20 mb-6 flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 rounded-xl border border-emerald-100 px-3 py-2">
        <Search className="h-4 w-4 text-emerald-700" />
        <input placeholder="Search users, bookings, hotels..." className="w-56 bg-transparent text-sm outline-none md:w-80" />
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-lg border border-emerald-100 p-2"><Bell className="h-4 w-4 text-emerald-700" /></button>
        <div className="rounded-lg border border-emerald-100 px-3 py-2 text-sm">Admin</div>
        <button className="rounded-lg bg-emerald-800 px-3 py-2 text-sm text-white"><LogOut className="mr-1 inline h-4 w-4" />Logout</button>
      </div>
    </header>
  );
}
