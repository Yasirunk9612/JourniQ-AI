"use client";

import { useState } from "react";

export default function AvailabilityCalendar() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState(1);

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5">
      <h3 className="text-lg text-emerald-950">Availability Controls</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2" />
        <input type="number" min={0} value={availableRooms} onChange={(e) => setAvailableRooms(Number(e.target.value))} className="rounded-xl border border-emerald-200 px-3 py-2" />
        <button className="rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white">Update Availability</button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <button className="rounded-xl border border-red-200 px-4 py-2 text-red-700 hover:bg-red-50">Block Selected Dates</button>
        <input placeholder="Seasonal price placeholder" className="rounded-xl border border-emerald-200 px-3 py-2" />
      </div>
      <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Calendar visualization placeholder (connect with availability API/state engine).</div>
    </section>
  );
}
