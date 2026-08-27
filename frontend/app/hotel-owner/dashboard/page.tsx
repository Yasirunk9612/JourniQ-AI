"use client";

import HotelOwnerStatCard from "@/components/hotel-owner/HotelOwnerStatCard";
import RevenueChart from "@/components/hotel-owner/RevenueChart";
import RecentBookingsTable from "@/components/hotel-owner/RecentBookingsTable";
import MarketInsightCard from "@/components/hotel-owner/MarketInsightCard";
import { useHotelOwnerDashboard } from "@/hooks/useHotelOwner";
import { formatLkr } from "@/lib/currency";

export default function HotelOwnerDashboardPage() {
  const { data, loading, error } = useHotelOwnerDashboard();

  if (loading) return <p className="text-emerald-800">Loading dashboard...</p>;
  if (error || !data) return <p className="text-red-700">{error || "Failed to load dashboard."}</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-emerald-900 to-neutral-900 p-6 text-white">
        <h1 className="text-3xl">Welcome Back</h1>
        <p className="mt-2 text-emerald-100/90">Monitor rooms, bookings, revenue, and market demand insights in one place.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <HotelOwnerStatCard title="Total Rooms" value={String(data.stats.totalRooms)} iconName="hotel" />
        <HotelOwnerStatCard title="Active Bookings" value={String(data.stats.activeBookings)} iconName="calendar_clock" />
        <HotelOwnerStatCard title="Monthly Revenue" value={formatLkr(data.stats.monthlyRevenue)} iconName="dollar" />
        <HotelOwnerStatCard title="Platform Commission" value={formatLkr(data.stats.platformCommission)} subtitle="3%" iconName="hand_coins" />
        <HotelOwnerStatCard title="Available Rooms" value={String(data.stats.availableRooms)} iconName="bed_double" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><RevenueChart data={data.revenueTrend} /></div>
        <MarketInsightCard insight={data.topInsight} />
      </section>

      <section>
        <h2 className="mb-3 text-xl text-emerald-950">Recent Bookings</h2>
        <RecentBookingsTable bookings={data.recentBookings} />
      </section>
    </div>
  );
}
