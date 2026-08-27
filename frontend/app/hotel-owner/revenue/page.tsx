"use client";

import RevenueChart from "@/components/hotel-owner/RevenueChart";
import HotelOwnerStatCard from "@/components/hotel-owner/HotelOwnerStatCard";
import { useHotelOwnerRevenue } from "@/hooks/useHotelOwner";
import { formatLkr } from "@/lib/currency";

export default function RevenuePage() {
  const { data, loading, error } = useHotelOwnerRevenue();

  if (loading) return <p className="text-emerald-800">Loading revenue...</p>;
  if (error || !data) return <p className="text-red-700">{error || "Failed to load revenue."}</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl text-emerald-950">Revenue Analytics</h1>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HotelOwnerStatCard title="Total Revenue" value={formatLkr(data.summary.totalRevenue)} iconName="dollar" />
        <HotelOwnerStatCard title="Platform Commission" value={formatLkr(data.summary.platformCommission)} subtitle="3%" iconName="hand_coins" />
        <HotelOwnerStatCard title="Net Earnings" value={formatLkr(data.summary.netEarnings)} subtitle="97%" iconName="wallet" />
        <HotelOwnerStatCard title="Completed Bookings" value={String(data.summary.completedBookings)} iconName="calendar_check" />
      </section>
      <RevenueChart data={data.monthlyBreakdown} />
    </div>
  );
}
