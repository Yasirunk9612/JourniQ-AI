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
  if (users.length === 0) {
    return <div className="rounded-[1.5rem] border border-dashed border-emerald-200 bg-white p-8 text-center text-sm text-slate-600">No users match the selected filters.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:hidden">
        {users.map((u) => <UserCard key={u.id} user={u} onBlock={onBlock} onUnblock={onUnblock} onDelete={onDelete} />)}
      </div>
      <div className="hidden overflow-x-auto rounded-[1.5rem] border border-emerald-100 bg-white shadow-sm lg:block">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-muted)] text-left text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr><th className="px-5 py-4">Name</th><th>Email</th><th>Role</th><th>Status</th><th className="px-5">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-emerald-100 text-slate-700">
                <td className="px-5 py-4"><p className="font-extrabold text-[var(--color-midnight)]">{u.name}</p></td>
                <td className="max-w-72 truncate">{u.email}</td>
                <td className="capitalize">{u.role.replace("_", " ")}</td>
                <td><AdminStatusBadge status={u.status} /></td>
                <td className="px-5"><UserActions user={u} onBlock={onBlock} onUnblock={onUnblock} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserCard({ user, onBlock, onUnblock, onDelete }: { user: AdminUser; onBlock?: (id: string) => void; onUnblock?: (id: string) => void; onDelete?: (id: string) => void }) {
  return (
    <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-extrabold text-[var(--color-midnight)]">{user.name}</h3>
          <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-teal)]">{user.role.replace("_", " ")}</p>
        </div>
        <AdminStatusBadge status={user.status} />
      </div>
      <div className="mt-4"><UserActions user={user} onBlock={onBlock} onUnblock={onUnblock} onDelete={onDelete} /></div>
    </article>
  );
}

function UserActions({ user, onBlock, onUnblock, onDelete }: { user: AdminUser; onBlock?: (id: string) => void; onUnblock?: (id: string) => void; onDelete?: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {user.status === "blocked" ? <button onClick={() => onUnblock?.(user.id)} className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-extrabold text-emerald-700">Unblock</button> : <button onClick={() => onBlock?.(user.id)} className="rounded-full border border-amber-200 px-3 py-1.5 text-xs font-extrabold text-amber-700">Block</button>}
      <button onClick={() => onDelete?.(user.id)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-extrabold text-red-700">Delete</button>
    </div>
  );
}
