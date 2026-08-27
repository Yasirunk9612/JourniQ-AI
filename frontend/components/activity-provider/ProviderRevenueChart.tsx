"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ProviderRevenueRow } from "@/types/activityProvider";
import { formatLkr } from "@/lib/currency";

export default function ProviderRevenueChart({ rows }: { rows: ProviderRevenueRow[] }) {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <div className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-4">
        <h3 className="mb-2 text-lg text-emerald-950">Revenue Trend</h3>
        <div className="h-60 min-h-60 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatLkr(Number(value))} width={92} />
              <Tooltip formatter={(value) => formatLkr(Number(value))} />
              <Line type="monotone" dataKey="totalRevenue" stroke="#d4a437" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-4">
        <h3 className="mb-2 text-lg text-emerald-950">Net Earning</h3>
        <div className="h-60 min-h-60 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatLkr(Number(value))} width={92} />
              <Tooltip formatter={(value) => formatLkr(Number(value))} />
              <Bar dataKey="netEarning" fill="#065f46" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
