"use client";

import ActivityCalendar from "@/components/activity-provider/ActivityCalendar";
import { useActivityCalendar } from "@/hooks/useActivityProvider";

export default function ProviderCalendarPage() {
  // API-ready endpoints: GET /api/activity-provider/calendar, PUT /api/activity-provider/calendar
  const { events, upcomingBookings, loading, error, updateCalendar, deleteCalendarEvent } = useActivityCalendar();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-emerald-950">Calendar</h1>
      <ActivityCalendar onSave={updateCalendar} />
      {loading ? <p className="text-emerald-800">Loading calendar...</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5"><h3 className="text-lg text-emerald-950">Scheduled Events</h3><ul className="mt-3 space-y-2 text-sm text-emerald-900">{events.map((e) => <li key={e._id} className="flex items-center justify-between gap-3"><span>{String(e.fromDate).slice(0,10)} to {String(e.toDate).slice(0,10)} • {e.isBlocked ? "Blocked" : "Available"}</span>{e._id ? <button onClick={() => deleteCalendarEvent(e._id as string)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700">Delete</button> : null}</li>)}</ul></section>
      <section className="rounded-2xl border border-emerald-100 bg-white p-5"><h3 className="text-lg text-emerald-950">Upcoming Bookings</h3><ul className="mt-3 space-y-2 text-sm text-emerald-900">{upcomingBookings.map((b) => <li key={b._id || b.bookingId}>{b.bookingId} • {b.experienceTitle} • {String(b.date).slice(0,10)}</li>)}</ul></section>
    </div>
  );
}
