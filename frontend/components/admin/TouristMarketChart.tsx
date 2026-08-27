"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["#065f46", "#0f766e", "#ca8a04", "#334155", "#16a34a"];

export default function TouristMarketChart({ data }: { data: Array<{ name: string; value: number }> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-4">
      <h3 className="mb-3 text-lg text-emerald-950">Tourist Source Markets</h3>
      <div className="h-72 min-h-72 min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
                {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
