"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MonthlyRevenue } from "@/types/hotelOwner";
import { formatLkr } from "@/lib/currency";

export default function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  return (
    <div className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-4">
      <h3 className="mb-3 text-lg text-emerald-950">Revenue Trend</h3>
      <div className="h-60 min-h-60 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#065f46" />
            <YAxis stroke="#065f46" tickFormatter={(value) => formatLkr(Number(value))} width={92} />
            <Tooltip formatter={(value) => formatLkr(Number(value))} />
            <Line type="monotone" dataKey="totalRevenue" stroke="#d4a437" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
