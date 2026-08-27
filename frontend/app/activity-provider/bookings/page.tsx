"use client";

import { useMemo, useState } from "react";
import ProviderBookingsTable from "@/components/activity-provider/ProviderBookingsTable";
import { useActivityBookings } from "@/hooks/useActivityProvider";

export default function ProviderBookingsPage() {
  // API-ready endpoints: GET /api/activity-provider/bookings, PATCH /api/activity-provider/bookings/:id/status
  const { bookings, loading, error, setStatus } = useActivityBookings();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => bookings.filter((b) => b.bookingId.toLowerCase().includes(search.toLowerCase()) || b.touristName.toLowerCase().includes(search.toLowerCase())), [bookings, search]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-emerald-950">Bookings</h1>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search booking/tourist" className="w-full max-w-md rounded-xl border border-emerald-200 px-3 py-2" />
      {loading ? <p className="text-emerald-800">Loading bookings...</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}
      <ProviderBookingsTable bookings={filtered} onStatus={setStatus} />
    </div>
  );
}
