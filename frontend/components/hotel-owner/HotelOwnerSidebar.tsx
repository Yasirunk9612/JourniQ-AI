"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BedDouble, CalendarCheck2, ClipboardList, DollarSign, Hotel, LayoutDashboard, MessageCircle, Settings, TrendingUp } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const items = [
  { label: "Dashboard", href: "/hotel-owner/dashboard", icon: LayoutDashboard },
  { label: "Hotel Profile", href: "/hotel-owner/hotel-profile", icon: Hotel },
  { label: "Rooms", href: "/hotel-owner/rooms", icon: BedDouble },
  { label: "Bookings", href: "/hotel-owner/bookings", icon: ClipboardList },
  { label: "Messages", href: "/hotel-owner/messages", icon: MessageCircle },
  { label: "Availability", href: "/hotel-owner/availability", icon: CalendarCheck2 },
  { label: "Revenue", href: "/hotel-owner/revenue", icon: DollarSign },
  { label: "Market Insights", href: "/hotel-owner/market-insights", icon: TrendingUp },
  { label: "Settings", href: "/hotel-owner/settings", icon: Settings },
];

export default function HotelOwnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-r border-emerald-100 bg-white lg:w-72">
      <div className="border-b border-emerald-100 px-5 py-5">
        <BrandLogo href="/hotel-owner/dashboard" sublabel="Hotel Owner Panel" />
      </div>
      <nav className="space-y-1 p-3">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active ? "bg-emerald-800 text-white" : "text-emerald-900 hover:bg-emerald-50"}`}>
              <Icon size={16} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
        <p className="font-semibold">API Ready</p>
        <p className="mt-1">Connect panel services to `/api/hotel-owner/*` endpoints when backend modules are available.</p>
      </div>
      <div className="p-3 text-xs text-emerald-600"><BarChart3 className="inline" size={14} /> v1 panel mock mode</div>
    </aside>
  );
}
