"use client";

import { Bell, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { hotelOwnerName } from "@/data/hotelOwnerMockData";

export default function HotelOwnerTopbar() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login/hotel-owner");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
          <input className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-amber-200" placeholder="Search bookings, rooms, guests..." />
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-emerald-200 p-2 text-emerald-700"><Bell size={18} /></button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-emerald-950">{hotelOwnerName}</p>
            <p className="text-xs text-emerald-700">Hotel Owner</p>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-1 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900"><LogOut size={14} /> Logout</button>
        </div>
      </div>
    </header>
  );
}
