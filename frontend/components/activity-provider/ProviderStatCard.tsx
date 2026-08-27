"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export default function ProviderStatCard({ title, value, icon: Icon, subtitle }: { title: string; value: string; icon: LucideIcon; subtitle?: string }) {
  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><p className="text-sm text-emerald-700">{title}</p><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><Icon size={18} /></span></div>
      <h3 className="mt-3 text-2xl text-emerald-950">{value}</h3>
      {subtitle ? <p className="mt-1 text-xs text-emerald-700/80">{subtitle}</p> : null}
    </motion.article>
  );
}
