import { ExperienceStatus, ProviderBookingStatus } from "@/types/activityProvider";

export default function ProviderStatusBadge({ status }: { status: ExperienceStatus | ProviderBookingStatus }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    active: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-700",
    confirmed: "bg-sky-100 text-sky-800",
    completed: "bg-indigo-100 text-indigo-800",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || "bg-neutral-100 text-neutral-800"}`}>{status}</span>;
}
