"use client";

import { useMemo, useState } from "react";
import BookingStatusBadge from "@/components/hotel-owner/BookingStatusBadge";
import { useHotelOwnerBookings } from "@/hooks/useHotelOwner";
import { formatLkr } from "@/lib/currency";

export default function BookingsPage() {
  const { bookings, loading, error, setStatus } = useHotelOwnerBookings();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => bookings.filter((b) => (statusFilter === "all" || b.status === statusFilter) && (((b.bookingId || b.id) || "").toLowerCase().includes(search.toLowerCase()) || b.guestName.toLowerCase().includes(search.toLowerCase()))), [statusFilter, search, bookings]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-emerald-950">Booking Management</h1>
      <div className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 md:grid-cols-3">
        <input placeholder="Search by booking ID / guest" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2"><option value="all">All status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="rejected">Rejected</option><option value="completed">Completed</option></select>
        <input type="date" className="rounded-xl border border-emerald-200 px-3 py-2" />
      </div>

      {loading ? <p className="text-emerald-800">Loading bookings...</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white">
        <table className="w-full min-w-[1040px] text-sm"><thead className="bg-emerald-50 text-emerald-800"><tr><th className="px-4 py-3 text-left">Booking ID</th><th className="px-4 py-3 text-left">Guest</th><th className="px-4 py-3 text-left">Room Type</th><th className="px-4 py-3 text-left">Check-in</th><th className="px-4 py-3 text-left">Check-out</th><th className="px-4 py-3 text-left">Total</th><th className="px-4 py-3 text-left">Commission 3%</th><th className="px-4 py-3 text-left">Provider 97%</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th></tr></thead><tbody>{filtered.map((b) => { const id = b._id || b.id; const commission = b.totalAmount * 0.03; const providerEarning = b.totalAmount * 0.97; return <tr key={id} className="border-t border-emerald-100"><td className="px-4 py-3">{b.bookingId || b.id}</td><td className="px-4 py-3">{b.guestName}</td><td className="px-4 py-3">{b.roomType}</td><td className="px-4 py-3">{String(b.checkIn).slice(0,10)}</td><td className="px-4 py-3">{String(b.checkOut).slice(0,10)}</td><td className="px-4 py-3">{formatLkr(b.totalAmount)}</td><td className="px-4 py-3">{formatLkr(commission)}</td><td className="px-4 py-3">{formatLkr(providerEarning)}</td><td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => setStatus(id, "confirmed")} className="rounded-lg bg-emerald-700 px-2.5 py-1 text-xs text-white">Confirm</button><button onClick={() => setStatus(id, "rejected")} className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-700">Reject</button><button className="rounded-lg border border-emerald-200 px-2.5 py-1 text-xs">Details</button></div></td></tr>; })}</tbody></table>
      </div>
    </div>
  );
}
