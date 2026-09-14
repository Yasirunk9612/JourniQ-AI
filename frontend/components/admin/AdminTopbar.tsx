"use client";

import { Bell, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminTopbar() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.replace("/login/admin");
  };

  return (
    <header className="sticky top-0 z-20 mb-6 flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 rounded-xl border border-emerald-100 px-3 py-2">
        <Search className="h-4 w-4 text-emerald-700" />
        <input placeholder="Search users, bookings, hotels..." className="w-56 bg-transparent text-sm outline-none md:w-80" />
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-lg border border-emerald-100 p-2"><Bell className="h-4 w-4 text-emerald-700" /></button>
        <div className="rounded-lg border border-emerald-100 px-3 py-2 text-sm">{user?.name || "Admin"}</div>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="rounded-lg bg-emerald-800 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogOut className="mr-1 inline h-4 w-4" />{loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
