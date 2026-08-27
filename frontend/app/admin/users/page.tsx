"use client";

import { useEffect, useState } from "react";
import UsersTable from "@/components/admin/UsersTable";
import { useAdminUsers } from "@/hooks/useAdmin";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const { users, loading, error, load, blockUser, unblockUser, deleteUser } = useAdminUsers();

  useEffect(() => {
    load({ role: role === "all" ? undefined : role, status: status === "all" ? undefined : status, search: q || undefined });
  }, [q, role, status, load]);

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">User Management</h1><div className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 md:grid-cols-4"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/email" className="rounded-xl border border-emerald-200 px-3 py-2" /><select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2"><option value="all">All roles</option><option value="tourist">tourist</option><option value="hotel_owner">hotel_owner</option><option value="activity_provider">activity_provider</option><option value="admin">admin</option></select><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2"><option value="all">All statuses</option><option value="active">active</option><option value="pending">pending</option><option value="blocked">blocked</option></select></div>{loading ? <p className="text-emerald-800">Loading users...</p> : null}{error ? <p className="text-red-700">{error}</p> : null}<UsersTable users={users} onBlock={blockUser} onUnblock={unblockUser} onDelete={deleteUser} /></div>;
}
