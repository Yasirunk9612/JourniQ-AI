"use client";

import { AdminUser } from "@/types/admin";
import AdminStatusBadge from "./AdminStatusBadge";

export default function UsersTable({
  users,
  onBlock,
  onUnblock,
  onDelete,
}: {
  users: AdminUser[];
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-emerald-50 text-left text-emerald-900"><tr><th className="px-4 py-3">Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-emerald-100"><td className="px-4 py-3 font-medium">{u.name}</td><td>{u.email}</td><td className="capitalize">{u.role.replace("_", " ")}</td><td><AdminStatusBadge status={u.status} /></td><td className="space-x-2 py-3">{u.status === "blocked" ? <button onClick={() => onUnblock?.(u.id)} className="rounded-md border border-emerald-200 px-2 py-1 text-emerald-700">Unblock</button> : <button onClick={() => onBlock?.(u.id)} className="rounded-md border border-amber-200 px-2 py-1 text-amber-700">Block</button>}<button onClick={() => onDelete?.(u.id)} className="rounded-md border border-red-200 px-2 py-1 text-red-700">Delete</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
