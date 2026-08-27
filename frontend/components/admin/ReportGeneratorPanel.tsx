"use client";

const reports = ["Booking report", "Revenue report", "Tourist market report", "Hotel performance report", "Activity provider report", "AI recommendation test report"];

export default function ReportGeneratorPanel() {
  return <section className="rounded-2xl border border-emerald-100 bg-white p-4"><h3 className="text-lg text-emerald-950">Report Generator</h3><div className="mt-3 grid gap-3 md:grid-cols-3"><input type="date" className="rounded-xl border border-emerald-200 px-3 py-2" /><input type="date" className="rounded-xl border border-emerald-200 px-3 py-2" /><select className="rounded-xl border border-emerald-200 px-3 py-2">{reports.map((r) => <option key={r}>{r}</option>)}</select></div><div className="mt-4 flex gap-2"><button className="rounded-xl bg-emerald-800 px-4 py-2 text-white">Export PDF</button><button className="rounded-xl border border-emerald-200 px-4 py-2">Export CSV</button></div></section>;
}
