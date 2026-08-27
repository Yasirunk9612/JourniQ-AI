"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export default function AdminStatCard({ title, value, icon: Icon }: { title: string; value: string; icon: LucideIcon }) {
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-emerald-900/80">{title}</p>
        <Icon className="h-5 w-5 text-emerald-700" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-emerald-950">{value}</p>
    </motion.article>
  );
}
