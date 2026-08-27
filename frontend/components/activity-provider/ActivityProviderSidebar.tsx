"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, ClipboardList, Compass, LayoutDashboard, Lightbulb, MessageCircle, Settings, Users } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const items = [
  { label: "Dashboard", href: "/activity-provider/dashboard", icon: LayoutDashboard },
  { label: "Experiences", href: "/activity-provider/experiences", icon: Compass },
  { label: "Bookings", href: "/activity-provider/bookings", icon: ClipboardList },
  { label: "Messages", href: "/activity-provider/messages", icon: MessageCircle },
  { label: "Calendar", href: "/activity-provider/calendar", icon: CalendarDays },
  { label: "Revenue", href: "/activity-provider/revenue", icon: BarChart3 },
  { label: "Community Profile", href: "/activity-provider/community-profile", icon: Users },
  { label: "AI Insights", href: "/activity-provider/ai-insights", icon: Lightbulb },
  { label: "Settings", href: "/activity-provider/settings", icon: Settings },
];

export default function ActivityProviderSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full border-r border-emerald-100 bg-white lg:w-72">
      <div className="border-b border-emerald-100 px-5 py-5"><BrandLogo href="/activity-provider/dashboard" sublabel="Activity Provider Panel" /></div>
      <nav className="space-y-1 p-3">{items.map(({ label, href, icon: Icon }) => { const active = pathname === href; return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active ? "bg-emerald-800 text-white" : "text-emerald-900 hover:bg-emerald-50"}`}><Icon size={16} /> {label}</Link>; })}</nav>
    </aside>
  );
}
