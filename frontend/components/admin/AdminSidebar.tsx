"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, BrainCircuit, Building2, CircleDollarSign, Cog, Cpu, DatabaseZap, LayoutDashboard, LifeBuoy, ListChecks, MapPinned, ReceiptText, ShieldCheck, Users } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/admin/hotels", label: "Hotels", icon: Building2 },
  { href: "/admin/experiences", label: "Experiences", icon: BookOpen },
  { href: "/admin/destinations", label: "Destinations", icon: MapPinned },
  { href: "/admin/bookings", label: "Bookings", icon: ListChecks },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/ai-monitoring", label: "AI Monitoring", icon: Cpu },
  { href: "/admin/tourism-analytics", label: "Tourism AI", icon: BrainCircuit },
  { href: "/admin/recommendation-audit", label: "AI Audit", icon: ShieldCheck },
  { href: "/admin/data-quality", label: "Data Quality", icon: DatabaseZap },
  { href: "/admin/help", label: "Help Inbox", icon: LifeBuoy },
  { href: "/admin/commission", label: "Commission", icon: CircleDollarSign },
  { href: "/admin/reports", label: "Reports", icon: ReceiptText },
  { href: "/admin/settings", label: "Settings", icon: Cog },
];

export default function AdminSidebar() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-emerald-100 bg-emerald-950 p-4 text-emerald-50 lg:block">
      <BrandLogo href="/admin/dashboard" inverted sublabel="Admin" className="mb-6" />
      <nav className="grid gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${path === href ? "bg-emerald-800 text-white" : "text-emerald-100 hover:bg-emerald-900"}`}>
            <Icon className="h-4 w-4" />{label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
