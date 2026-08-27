export default function AdminStatusBadge({ status }: { status: string }) {
  const tone = {
    active: "bg-emerald-100 text-emerald-800",
    approved: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    blocked: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-zinc-200 text-zinc-800",
    confirmed: "bg-sky-100 text-sky-800",
    completed: "bg-emerald-100 text-emerald-800",
  } as Record<string, string>;
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[status] || "bg-zinc-100 text-zinc-700"}`}>{status}</span>;
}
