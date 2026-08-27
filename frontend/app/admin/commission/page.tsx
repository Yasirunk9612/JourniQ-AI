"use client";

import CommissionBreakdownCard from "@/components/admin/CommissionBreakdownCard";
import PlatformRevenueChart from "@/components/admin/PlatformRevenueChart";
import BookingsManagementTable from "@/components/admin/BookingsManagementTable";
import { useAdminCommission } from "@/hooks/useAdmin";

export default function AdminCommissionPage() {
  const { data, loading, error } = useAdminCommission();
  if (loading) return <p className="text-emerald-800">Loading commission...</p>;
  if (error) return <p className="text-red-700">{error}</p>;

  const summary = data?.summary || { totalBookingValue: 0 };
  const monthly = (data?.monthly || []).map((m: { month: string; totalBookingValue: number; platformRevenue: number }) => ({ month: m.month, revenue: m.totalBookingValue, commission: m.platformRevenue }));
  const rows = (data?.rows || []).slice(0, 20).map((r: { sourceBookingId: string; sourceType: "hotel" | "activity"; totalAmount: number; status: string; bookedAt: string }) => ({ id: r.sourceBookingId, customer: "-", provider: r.sourceType, type: r.sourceType, district: "", totalAmount: r.totalAmount, status: r.status, date: r.bookedAt }));

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Commission Dashboard</h1><div className="grid gap-4 xl:grid-cols-2"><CommissionBreakdownCard total={summary.totalBookingValue || 0} /><PlatformRevenueChart data={monthly} /></div><section className="space-y-2"><h2 className="text-lg">Recent Commission Rows</h2><BookingsManagementTable bookings={rows} /></section></div>;
}
