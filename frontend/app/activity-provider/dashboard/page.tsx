"use client";

import Link from "next/link";
import { CalendarClock, DollarSign, HandCoins, Star, Compass } from "lucide-react";
import ProviderStatCard from "@/components/activity-provider/ProviderStatCard";
import ProviderRevenueChart from "@/components/activity-provider/ProviderRevenueChart";
import ProviderBookingsTable from "@/components/activity-provider/ProviderBookingsTable";
import { useActivityProviderDashboard, useActivityBookings } from "@/hooks/useActivityProvider";
import { formatLkr } from "@/lib/currency";

export default function ActivityProviderDashboardPage() {
  // API-ready endpoint: GET /api/activity-provider/dashboard
  const { data, loading, error } = useActivityProviderDashboard();
  const { bookings, setStatus } = useActivityBookings();

  if (loading) return <p className="text-emerald-800">Loading dashboard...</p>;
  if (error || !data) return <p className="text-red-700">{error || "Failed to load dashboard."}</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-emerald-900 to-neutral-900 p-6 text-white"><h1 className="text-3xl">Welcome Back</h1><p className="mt-2 text-emerald-100/90">Manage community experiences, bookings, and growth insights.</p></section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ProviderStatCard title="Total Experiences" value={String(data.stats.totalExperiences)} icon={Compass} />
        <ProviderStatCard title="Active Bookings" value={String(data.stats.activeBookings)} icon={CalendarClock} />
        <ProviderStatCard title="Monthly Revenue" value={formatLkr(data.stats.monthlyRevenue)} icon={DollarSign} />
        <ProviderStatCard title="Platform Commission" value={formatLkr(data.stats.platformCommission)} subtitle="3%" icon={HandCoins} />
        <ProviderStatCard title="Average Rating" value={String(data.stats.averageRating)} icon={Star} />
      </section>

      <ProviderRevenueChart rows={data.revenueTrend.map((r) => ({ month: r.month, totalRevenue: r.totalRevenue, commissionPaid: r.totalRevenue * 0.03, netEarning: r.totalRevenue * 0.97 }))} />

      {data.topExperience ? <section className="rounded-2xl border border-emerald-100 bg-white p-5"><h3 className="text-lg text-emerald-950">Top Performing Experience</h3><p className="mt-2 text-emerald-900">{data.topExperience.title} • {data.topExperience.category} • {data.topExperience.bookingsCount || 0} bookings</p></section> : null}

      <section><h3 className="mb-3 text-lg text-emerald-950">Upcoming Bookings</h3><ProviderBookingsTable bookings={bookings.slice(0, 6)} onStatus={setStatus} /></section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/activity-provider/experiences" className="rounded-xl bg-emerald-800 px-4 py-3 text-center font-semibold text-white">Add Experience</Link>
        <Link href="/activity-provider/calendar" className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-center font-semibold text-emerald-900">Update Calendar</Link>
        <Link href="/activity-provider/bookings" className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-center font-semibold text-emerald-900">View Bookings</Link>
      </section>
    </div>
  );
}
