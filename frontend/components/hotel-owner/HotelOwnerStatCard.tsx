"use client";

import { BedDouble, CalendarCheck2, CalendarClock, DollarSign, HandCoins, Hotel, Wallet } from "lucide-react";
import { motion } from "framer-motion";

type StatIconName =
  | "hotel"
  | "calendar_clock"
  | "dollar"
  | "hand_coins"
  | "bed_double"
  | "wallet"
  | "calendar_check";

const iconMap = {
  hotel: Hotel,
  calendar_clock: CalendarClock,
  dollar: DollarSign,
  hand_coins: HandCoins,
  bed_double: BedDouble,
  wallet: Wallet,
  calendar_check: CalendarCheck2,
} as const;

export default function HotelOwnerStatCard({
  title,
  value,
  subtitle,
  iconName,
}: {
  title: string;
  value: string;
  subtitle?: string;
  iconName: StatIconName;
}) {
  const Icon = iconMap[iconName];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-emerald-700">{title}</p>
        <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><Icon size={18} /></span>
      </div>
      <h3 className="mt-3 text-2xl text-emerald-950">{value}</h3>
      {subtitle ? <p className="mt-1 text-xs text-emerald-700/80">{subtitle}</p> : null}
    </motion.article>
  );
}
