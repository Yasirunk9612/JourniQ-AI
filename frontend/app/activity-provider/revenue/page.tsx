"use client";

import { CalendarCheck2, DollarSign, HandCoins, Wallet } from "lucide-react";
import ProviderStatCard from "@/components/activity-provider/ProviderStatCard";
import ProviderRevenueChart from "@/components/activity-provider/ProviderRevenueChart";
import { useActivityRevenue } from "@/hooks/useActivityProvider";
import { formatLkr } from "@/lib/currency";

export default function ProviderRevenuePage() {
  // API-ready endpoint: GET /api/activity-provider/revenue
  const { summary, rows, loading, error } = useActivityRevenue();
  if (loading) return <p className="text-emerald-800">Loading revenue...</p>;
  if (error || !summary) return <p className="text-red-700">{error || "Failed to load revenue."}</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl text-emerald-950">Revenue</h1>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProviderStatCard title="Total Revenue" value={formatLkr(summary.totalRevenue)} icon={DollarSign} />
        <ProviderStatCard title="Commission Paid" value={formatLkr(summary.commissionPaid)} subtitle="3%" icon={HandCoins} />
        <ProviderStatCard title="Net Earning" value={formatLkr(summary.netEarning)} subtitle="97%" icon={Wallet} />
        <ProviderStatCard title="Completed Experiences" value={String(summary.completedExperiences)} icon={CalendarCheck2} />
      </section>
      <ProviderRevenueChart rows={rows} />
      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white"><table className="w-full min-w-[700px] text-sm"><thead className="bg-emerald-50 text-emerald-800"><tr><th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-left">Total Revenue</th><th className="px-4 py-3 text-left">Commission</th><th className="px-4 py-3 text-left">Net Earning</th></tr></thead><tbody>{rows.map((r) => <tr key={r.month} className="border-t border-emerald-100"><td className="px-4 py-3">{r.month}</td><td className="px-4 py-3">{formatLkr(r.totalRevenue)}</td><td className="px-4 py-3">{formatLkr(r.commissionPaid)}</td><td className="px-4 py-3">{formatLkr(r.netEarning)}</td></tr>)}</tbody></table></div>
    </div>
  );
}
