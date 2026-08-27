"use client";

import { Activity, CheckCircle2, Clock3, Server } from "lucide-react";
import AIModelTestPanel from "@/components/admin/AIModelTestPanel";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { useAdminAiMonitoring } from "@/hooks/useAdmin";

export default function AdminAiMonitoringPage() {
  const { result, loading, runTest } = useAdminAiMonitoring();
  const status = result?.modelStatus || { contentModel: "active", marketDemandModel: "active", apiStatus: "healthy", lastTrainedDate: "2026-04-18" };
  const rows = (result?.results || []).map((r: { entityName: string; finalScore: number; contentScore: number; demandScore: number; explanation: string }, idx: number) => ({ ...r, id: String(idx + 1) }));

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">AI Monitoring</h1><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><AdminStatCard title="Content model" value={status.contentModel} icon={CheckCircle2} /><AdminStatCard title="Demand model" value={status.marketDemandModel} icon={Activity} /><AdminStatCard title="API status" value={status.apiStatus} icon={Server} /><AdminStatCard title="Last trained" value={status.lastTrainedDate} icon={Clock3} /></section><AIModelTestPanel results={rows} onRun={runTest} running={loading} /></div>;
}
