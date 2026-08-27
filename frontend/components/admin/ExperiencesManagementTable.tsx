import { Ban, Check, PauseCircle, Sparkles } from "lucide-react";
import { AdminExperience } from "@/types/admin";
import AdminStatusBadge from "./AdminStatusBadge";
import { formatLkr } from "@/lib/currency";

export default function ExperiencesManagementTable({
  experiences,
  onStatus,
  updatingId,
}: {
  experiences: AdminExperience[];
  onStatus?: (id: string, status: string) => void;
  updatingId?: string;
}) {
  if (experiences.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-emerald-200 bg-white/75 p-8 text-center text-sm text-slate-600">
        No experiences match the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:hidden">
        {experiences.map((experience) => <ExperienceApprovalCard key={experience.id} experience={experience} onStatus={onStatus} updatingId={updatingId} />)}
      </div>

      <div className="hidden overflow-x-auto rounded-[1.75rem] border border-emerald-100 bg-white shadow-sm xl:block">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-muted)] text-left text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Experience</th>
              <th>Provider</th>
              <th>Category</th>
              <th>District</th>
              <th>Price</th>
              <th>Status</th>
              <th>Bookings</th>
              <th className="px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((experience) => (
              <tr key={experience.id} className="border-t border-emerald-100 text-slate-700">
                <td className="px-5 py-4">
                  <p className="font-extrabold text-[var(--color-midnight)]">{experience.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{experience.id}</p>
                </td>
                <td>{experience.provider}</td>
                <td className="capitalize">{experience.category}</td>
                <td>{experience.district || "-"}</td>
                <td>{formatLkr(experience.price)}</td>
                <td><AdminStatusBadge status={experience.status} /></td>
                <td>{experience.bookings}</td>
                <td className="px-5">
                  <ExperienceActions experience={experience} onStatus={onStatus} updatingId={updatingId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExperienceApprovalCard({ experience, onStatus, updatingId }: { experience: AdminExperience; onStatus?: (id: string, status: string) => void; updatingId?: string }) {
  return (
    <article className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-coral)]">{experience.category || "Experience"}</p>
          <h3 className="mt-2 text-xl font-extrabold text-[var(--color-midnight)]">{experience.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{experience.provider} · {experience.district || "Sri Lanka"}</p>
        </div>
        <AdminStatusBadge status={experience.status} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
        <Metric label="Price" value={formatLkr(experience.price)} />
        <Metric label="Bookings" value={String(experience.bookings)} />
        <Metric label="District" value={experience.district || "-"} />
      </div>
      <div className="mt-5">
        <ExperienceActions experience={experience} onStatus={onStatus} updatingId={updatingId} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--color-muted)] px-2 py-3">
      <p className="font-black text-[var(--color-midnight)]">{value}</p>
      <p className="mt-1">{label}</p>
    </div>
  );
}

function ExperienceActions({ experience, onStatus, updatingId }: { experience: AdminExperience; onStatus?: (id: string, status: string) => void; updatingId?: string }) {
  const busy = updatingId === experience.id;
  const approved = experience.status === "approved" || experience.status === "active";
  const rejected = experience.status === "rejected";
  const suspended = experience.status === "suspended";
  const active = experience.status === "active";

  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton disabled={busy || approved} onClick={() => onStatus?.(experience.id, "approved")} tone="approve" icon={<Check size={15} />}>
        {approved ? "Approved" : "Approve"}
      </ActionButton>
      <ActionButton disabled={busy || rejected} onClick={() => onStatus?.(experience.id, "rejected")} tone="reject" icon={<Ban size={15} />}>
        {rejected ? "Rejected" : "Reject"}
      </ActionButton>
      <ActionButton disabled={busy || rejected || suspended} onClick={() => onStatus?.(experience.id, "suspended")} tone="neutral" icon={<PauseCircle size={15} />}>
        {suspended ? "Suspended" : "Suspend"}
      </ActionButton>
      <ActionButton disabled={busy || active || rejected} onClick={() => onStatus?.(experience.id, "active")} tone="feature" icon={<Sparkles size={15} />}>
        {active ? "Featured" : "Feature"}
      </ActionButton>
    </div>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
  tone,
  icon,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  tone: "approve" | "reject" | "neutral" | "feature";
  icon: React.ReactNode;
}) {
  const toneClass = {
    approve: "bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-emerald-100 disabled:text-emerald-700",
    reject: "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:bg-red-50 disabled:text-red-300",
    neutral: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300",
    feature: "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:bg-amber-50 disabled:text-amber-300",
  }[tone];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold transition disabled:cursor-not-allowed ${toneClass}`}
    >
      {icon}
      {children}
    </button>
  );
}
