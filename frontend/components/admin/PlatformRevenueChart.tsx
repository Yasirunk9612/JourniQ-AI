"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatLkr } from "@/lib/currency";

export default function PlatformRevenueChart({ data }: { data: Array<{ month: string; revenue: number; commission: number }> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-4">
      <h3 className="mb-3 text-lg text-emerald-950">Platform Revenue</h3>
      <div className="h-72 min-h-72 min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={data}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatLkr(Number(value))} width={92} />
              <Tooltip formatter={(value) => formatLkr(Number(value))} />
              <Line type="monotone" dataKey="revenue" stroke="#065f46" strokeWidth={2} />
              <Line type="monotone" dataKey="commission" stroke="#ca8a04" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
