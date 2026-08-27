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

  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-emerald-50 text-left text-emerald-900"><tr><th className="px-4 py-3">Name</th><th>Email</th><th>Role</th><th>Business</th><th>District</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{users.map((u) => {
          const actionable = u.status === "pending";
          const busy = workingId === u.id;
          return (
            <tr key={u.id} className="border-t border-emerald-100">
              <td className="px-4 py-3">{u.name}</td>
              <td>{u.email}</td>
              <td className="capitalize">{u.role.replace("_", " ")}</td>
              <td>{u.businessName || "-"}</td>
              <td>{u.district || "-"}</td>
              <td>{u.createdAt}</td>
              <td><AdminStatusBadge status={u.status} /></td>
              <td className="space-x-2">
                <button disabled={!actionable || Boolean(workingId)} onClick={() => void runAction(u.id, onApprove)} className="rounded-md bg-emerald-700 px-2 py-1 text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{busy ? "Approving..." : actionable ? "Approve" : "Approved"}</button>
                <button disabled={!actionable || Boolean(workingId)} onClick={() => void runAction(u.id, onReject)} className="rounded-md border border-red-200 px-2 py-1 text-red-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400">Reject</button>
              </td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}
