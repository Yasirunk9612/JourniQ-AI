"use client";

import { AdminUser } from "@/types/admin";
import AdminStatusBadge from "./AdminStatusBadge";
import { useState } from "react";

export default function ApprovalQueueTable({
  users,
  onApprove,
  onReject,
}: {
  users: AdminUser[];
  onApprove?: (id: string) => Promise<void> | void;
  onReject?: (id: string) => Promise<void> | void;
}) {
  const [workingId, setWorkingId] = useState("");

  const runAction = async (id: string, action?: (id: string) => Promise<void> | void) => {
    if (!action || workingId) return;
    setWorkingId(id);
    try {
      await action(id);
    } finally {
      setWorkingId("");
    }
  };

  if (users.length === 0) {
    return <div className="rounded-[1.5rem] border border-dashed border-emerald-200 bg-white p-8 text-center text-sm text-slate-600">No pending provider approvals.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:hidden">
        {users.map((user) => <ApprovalCard key={user.id} user={user} workingId={workingId} onRun={runAction} onApprove={onApprove} onReject={onReject} />)}
      </div>
      <div className="hidden overflow-x-auto rounded-[1.5rem] border border-emerald-100 bg-white shadow-sm xl:block">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-muted)] text-left text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr><th className="px-5 py-4">Name</th><th>Email</th><th>Role</th><th>Business</th><th>Location</th><th>Date</th><th>Status</th><th className="px-5">Actions</th></tr>
          </thead>
          <tbody>{users.map((u) => {
            const actionable = u.status === "pending";
            const busy = workingId === u.id;
            return (
              <tr key={u.id} className="border-t border-emerald-100 text-slate-700">
                <td className="px-5 py-4 font-extrabold text-[var(--color-midnight)]">{u.name}</td>
                <td className="max-w-64 truncate">{u.email}</td>
                <td className="capitalize">{u.role.replace("_", " ")}</td>
                <td>{u.businessName || "-"}</td>
                <td><MapLink item={u} /></td>
                <td>{formatDate(u.createdAt)}</td>
                <td><AdminStatusBadge status={u.status} /></td>
                <td className="px-5"><ApprovalActions user={u} busy={busy} disabled={!actionable || Boolean(workingId)} onRun={runAction} onApprove={onApprove} onReject={onReject} /></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

function ApprovalCard({ user, workingId, onRun, onApprove, onReject }: { user: AdminUser; workingId: string; onRun: (id: string, action?: (id: string) => Promise<void> | void) => Promise<void>; onApprove?: (id: string) => Promise<void> | void; onReject?: (id: string) => Promise<void> | void }) {
  const actionable = user.status === "pending";
  const busy = workingId === user.id;
  return (
    <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-extrabold text-[var(--color-midnight)]">{user.businessName || user.name}</h3>
          <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-teal)]">{user.role.replace("_", " ")} · {user.district || "Sri Lanka"}</p>
          <div className="mt-3"><MapLink item={user} /></div>
        </div>
        <AdminStatusBadge status={user.status} />
      </div>
      <div className="mt-4"><ApprovalActions user={user} busy={busy} disabled={!actionable || Boolean(workingId)} onRun={onRun} onApprove={onApprove} onReject={onReject} /></div>
    </article>
  );
}

function ApprovalActions({ user, busy, disabled, onRun, onApprove, onReject }: { user: AdminUser; busy: boolean; disabled: boolean; onRun: (id: string, action?: (id: string) => Promise<void> | void) => Promise<void>; onApprove?: (id: string) => Promise<void> | void; onReject?: (id: string) => Promise<void> | void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button disabled={disabled} onClick={() => void onRun(user.id, onApprove)} className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{busy ? "Approving..." : "Approve"}</button>
      <button disabled={disabled} onClick={() => void onRun(user.id, onReject)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-extrabold text-red-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400">Reject</button>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function MapLink({ item }: { item: Pick<AdminUser, "address" | "district" | "latitude" | "longitude"> }) {
  const hasCoords = item.latitude && item.longitude;
  const query = hasCoords ? `${item.latitude},${item.longitude}` : [item.address, item.district, "Sri Lanka"].filter(Boolean).join(", ");
  if (!query.trim()) return <span className="text-slate-400">No location</span>;
  return <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" className="font-extrabold text-[var(--color-teal)] hover:underline">Open map</a>;
}
