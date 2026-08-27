"use client";

import { useState } from "react";
import BookingsManagementTable from "@/components/admin/BookingsManagementTable";
import { useAdminBookings } from "@/hooks/useAdmin";

export default function AdminBookingsPage() {
  const { bookings, loading, error, load } = useAdminBookings();
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Bookings Management</h1><div className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 md:grid-cols-3"><select value={status} onChange={(e) => { const next = e.target.value; setStatus(next); load({ status: next === "all" ? undefined : next, type: type === "all" ? undefined : type }); }} className="rounded-xl border border-emerald-200 px-3 py-2"><option value="all">All Status</option><option value="pending">pending</option><option value="confirmed">confirmed</option><option value="rejected">rejected</option><option value="completed">completed</option></select><select value={type} onChange={(e) => { const next = e.target.value; setType(next); load({ status: status === "all" ? undefined : status, type: next === "all" ? undefined : next }); }} className="rounded-xl border border-emerald-200 px-3 py-2"><option value="all">All Types</option><option value="hotel">hotel</option><option value="activity">activity</option></select></div>{loading ? <p className="text-emerald-800">Loading bookings...</p> : null}{error ? <p className="text-red-700">{error}</p> : null}<BookingsManagementTable bookings={bookings} /></div>;
}
