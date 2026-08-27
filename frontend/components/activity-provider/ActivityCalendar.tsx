"use client";

import { useState } from "react";

export default function ActivityCalendar({ onSave }: { onSave: (payload: { fromDate: string; toDate: string; isBlocked: boolean; notes: string }) => Promise<void> }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [notes, setNotes] = useState("");

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5">
      <h3 className="text-lg text-emerald-950">Calendar Controls</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-4"><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2" /><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2" /><label className="flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2"><input type="checkbox" checked={isBlocked} onChange={(e) => setIsBlocked(e.target.checked)} /> Block dates</label><button onClick={() => onSave({ fromDate, toDate, isBlocked, notes })} className="rounded-xl bg-emerald-800 px-4 py-2 text-white">Save</button></div>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="mt-3 w-full rounded-xl border border-emerald-200 px-3 py-2" />
    </div>
  );
}
