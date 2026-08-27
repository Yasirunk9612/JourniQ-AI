"use client";

import ApprovalQueueTable from "@/components/admin/ApprovalQueueTable";
import { useAdminApprovals } from "@/hooks/useAdmin";

export default function AdminApprovalsPage() {
  const { users, loading, error, approve, reject } = useAdminApprovals();
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Approval Queue</h1>{loading ? <p className="text-emerald-800">Loading approvals...</p> : null}{error ? <p className="text-red-700">{error}</p> : null}<ApprovalQueueTable users={users} onApprove={approve} onReject={reject} /></div>;
}
