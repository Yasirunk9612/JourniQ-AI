"use client";

import { useMemo, useState } from "react";
import { Building2, CheckCircle2, Search, ShieldCheck, SlidersHorizontal, XCircle } from "lucide-react";
import HotelsManagementTable from "@/components/admin/HotelsManagementTable";
import { useAdminHotels } from "@/hooks/useAdmin";
import { AdminHotel } from "@/types/admin";

const statuses = ["all", "pending", "approved", "rejected", "suspended"];

export default function AdminHotelsPage() {
  const { hotels, loading, error, setStatus } = useAdminHotels();
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState("all");
  const [district, setDistrict] = useState("all");
  const [category, setCategory] = useState("all");
  const [updatingId, setUpdatingId] = useState("");

  const typedHotels = hotels as AdminHotel[];
  const districts = useMemo(() => uniqueValues(typedHotels.map((hotel) => hotel.district)), [typedHotels]);
  const categories = useMemo(() => uniqueValues(typedHotels.map((hotel) => hotel.category)), [typedHotels]);

  const filteredHotels = useMemo(() => {
    const term = query.trim().toLowerCase();
    return typedHotels.filter((hotel) => {
      const matchesQuery = !term || [hotel.hotelName, hotel.owner, hotel.district, hotel.category].join(" ").toLowerCase().includes(term);
      const matchesStatus = status === "all" || hotel.status === status;
      const matchesDistrict = district === "all" || hotel.district === district;
      const matchesCategory = category === "all" || hotel.category === category;
      return matchesQuery && matchesStatus && matchesDistrict && matchesCategory;
    });
  }, [category, district, query, status, typedHotels]);

  const stats = useMemo(() => ({
    total: typedHotels.length,
    pending: typedHotels.filter((hotel) => hotel.status === "pending").length,
    approved: typedHotels.filter((hotel) => hotel.status === "approved").length,
    rejected: typedHotels.filter((hotel) => hotel.status === "rejected").length,
  }), [typedHotels]);

  const updateStatus = async (id: string, nextStatus: string) => {
    setUpdatingId(id);
    try {
      await setStatus(id, nextStatus);
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-[var(--color-midnight)] p-6 text-white shadow-sm">
        <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-gold)]">
              <ShieldCheck size={14} /> Admin hotel approvals
            </p>
            <h1 className="mt-4 font-serif text-5xl font-black leading-none">Hotels management</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
              Review hotel listings, filter by approval status, and keep approved listings locked from duplicate approval clicks.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total" value={stats.total} icon={<Building2 size={17} />} />
            <Stat label="Pending" value={stats.pending} icon={<SlidersHorizontal size={17} />} />
            <Stat label="Approved" value={stats.approved} icon={<CheckCircle2 size={17} />} />
            <Stat label="Rejected" value={stats.rejected} icon={<XCircle size={17} />} />
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,0.75fr)]">
          <label className="relative block">
            <span className="sr-only">Search hotels</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search hotel, owner, district..."
              className="min-h-12 w-full rounded-2xl border border-emerald-100 bg-[var(--color-ivory)] pl-11 pr-4 text-sm outline-none focus:border-[var(--color-teal)] focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <FilterSelect label="Status" value={status} onChange={setStatusFilter} options={statuses} />
          <FilterSelect label="District" value={district} onChange={setDistrict} options={["all", ...districts]} />
          <FilterSelect label="Category" value={category} onChange={setCategory} options={["all", ...categories]} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <p><strong className="text-[var(--color-midnight)]">{filteredHotels.length}</strong> hotels shown</p>
          <button onClick={() => { setQuery(""); setStatusFilter("all"); setDistrict("all"); setCategory("all"); }} className="rounded-full border border-emerald-100 px-4 py-2 font-extrabold text-[var(--color-teal)]">
            Clear filters
          </button>
        </div>
      </section>

      {loading ? <div className="h-48 animate-pulse rounded-[1.75rem] bg-white" /> : null}
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : null}
      {!loading && !error ? <HotelsManagementTable hotels={filteredHotels} onStatus={updateStatus} updatingId={updatingId} /> : null}
    </div>
  );
}

function uniqueValues(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean))).sort();
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-4">
      <div className="flex items-center justify-between gap-3 text-white/70">
        {icon}
        <strong className="text-2xl text-white">{value}</strong>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-white/50">{label}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-emerald-100 bg-[var(--color-ivory)] px-4 text-sm capitalize outline-none focus:border-[var(--color-teal)] focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option.replace("_", " ")}</option>
        ))}
      </select>
    </label>
  );
}
