"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminAnalytics } from "@/hooks/useAdmin";

export default function AdminAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data, loading, error } = useAdminAnalytics();
  if (loading) return <p className="text-emerald-800">Loading analytics...</p>;
  if (error) return <p className="text-red-700">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tourism Analytics</h1>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {[
          { title: "Top Tourist Countries", data: data?.touristMarkets || [], x: "name", y: "value" },
          { title: "Monthly Bookings", data: data?.monthlyBookings || [], x: "month", y: "value" },
          { title: "Revenue by Category", data: data?.revenueByCategory || [], x: "name", y: "value" },
          { title: "Hotels by District", data: data?.hotelsByDistrict || [], x: "district", y: "value" },
          { title: "Experience Bookings by Category", data: data?.experienceBookingsByCategory || [], x: "name", y: "value" },
        ].map((c) => (
          <section key={c.title} className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-4">
            <h3 className="mb-2 text-lg">{c.title}</h3>
            <div className="h-64 min-h-64 min-w-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={c.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={c.x} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={c.y} fill="#065f46" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
