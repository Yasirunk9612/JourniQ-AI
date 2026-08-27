"use client";

import { Activity, Building2, Clock3, DollarSign, ListChecks, Users } from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import PlatformRevenueChart from "@/components/admin/PlatformRevenueChart";
import TouristMarketChart from "@/components/admin/TouristMarketChart";
import BookingsManagementTable from "@/components/admin/BookingsManagementTable";
import ApprovalQueueTable from "@/components/admin/ApprovalQueueTable";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { formatLkr } from "@/lib/currency";

export default function AdminDashboardPage() {
  const { data, loading, error } = useAdminDashboard();

  if (loading) return <p className="text-emerald-800">Loading dashboard...</p>;
  if (error) return <p className="text-red-700">{error}</p>;

  const stats = data?.stats || {};

  const pendingUsers = (data?.pendingApprovals || []).map((u: { id?: string; _id?: string }) => ({ ...u, id: u.id || u._id || "" }));
  return <div className="space-y-6"><h1 className="text-2xl font-semibold">Platform Dashboard</h1><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><AdminStatCard title="Total Users" value={String(stats.totalUsers || 0)} icon={Users} /><AdminStatCard title="Hotels" value={String(stats.hotelsCount || 0)} icon={Building2} /><AdminStatCard title="Activity Providers" value={String(stats.activityProviders || 0)} icon={Activity} /><AdminStatCard title="Total Bookings" value={String(stats.totalBookings || 0)} icon={ListChecks} /><AdminStatCard title="Platform Revenue" value={formatLkr(Number(stats.platformRevenue || 0))} icon={DollarSign} /><AdminStatCard title="Pending Approvals" value={String(stats.pendingApprovals || 0)} icon={Clock3} /></section><section className="grid gap-4 xl:grid-cols-2"><PlatformRevenueChart data={data?.revenueTrend || []} /><TouristMarketChart data={data?.touristMarkets || []} /></section><section className="space-y-3"><h2 className="text-xl">Recent Bookings</h2><BookingsManagementTable bookings={data?.recentBookings || []} /></section><section className="space-y-3"><h2 className="text-xl">Pending Approvals</h2><ApprovalQueueTable users={pendingUsers} /></section></div>;
}
