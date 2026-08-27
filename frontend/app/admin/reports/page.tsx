"use client";

import ReportGeneratorPanel from "@/components/admin/ReportGeneratorPanel";
import { useAdminReports } from "@/hooks/useAdmin";

export default function AdminReportsPage() {
  const { data, loading, error } = useAdminReports();
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Reports</h1>{loading ? <p className="text-emerald-800">Loading reports...</p> : null}{error ? <p className="text-red-700">{error}</p> : null}<ReportGeneratorPanel />{data?.reports ? <pre className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white p-4 text-xs text-emerald-900">{JSON.stringify(data.reports, null, 2)}</pre> : null}</div>;
}
