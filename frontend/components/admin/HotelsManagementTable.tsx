import { Ban, Check, PauseCircle } from "lucide-react";
import { AdminHotel } from "@/types/admin";
import AdminStatusBadge from "./AdminStatusBadge";
import { formatLkr } from "@/lib/currency";

export default function HotelsManagementTable({
  hotels,
  onStatus,
  updatingId,
}: {
  hotels: AdminHotel[];
  onStatus?: (id: string, status: string) => void;
  updatingId?: string;
}) {
  if (hotels.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-emerald-200 bg-white/75 p-8 text-center text-sm text-slate-600">
        No hotels match the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:hidden">
        {hotels.map((hotel) => <HotelApprovalCard key={hotel.id} hotel={hotel} onStatus={onStatus} updatingId={updatingId} />)}
      </div>

      <div className="hidden overflow-x-auto rounded-[1.75rem] border border-emerald-100 bg-white shadow-sm xl:block">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-muted)] text-left text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Hotel</th>
              <th>Owner</th>
              <th>District</th>
              <th>Category</th>
              <th>Rooms</th>
              <th>Status</th>
              <th>Bookings</th>
              <th>Revenue</th>
              <th className="px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.id} className="border-t border-emerald-100 text-slate-700">
                <td className="px-5 py-4">
                  <p className="font-extrabold text-[var(--color-midnight)]">{hotel.hotelName}</p>
                  <p className="mt-1 text-xs text-slate-500">{hotel.id}</p>
                </td>
                <td>{hotel.owner}</td>
                <td>{hotel.district || "-"}</td>
                <td className="capitalize">{String(hotel.category || "hotel").replace("_", " ")}</td>
                <td>{hotel.rooms}</td>
                <td><AdminStatusBadge status={hotel.status} /></td>
                <td>{hotel.bookings}</td>
                <td>{formatLkr(hotel.revenue)}</td>
                <td className="px-5">
                  <HotelActions hotel={hotel} onStatus={onStatus} updatingId={updatingId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HotelApprovalCard({ hotel, onStatus, updatingId }: { hotel: AdminHotel; onStatus?: (id: string, status: string) => void; updatingId?: string }) {
  return (
    <article className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal)]">{hotel.district || "Sri Lanka"}</p>
          <h3 className="mt-2 text-xl font-extrabold text-[var(--color-midnight)]">{hotel.hotelName}</h3>
          <p className="mt-1 text-sm text-slate-500">{hotel.owner}</p>
        </div>
        <AdminStatusBadge status={hotel.status} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
        <Metric label="Rooms" value={String(hotel.rooms)} />
        <Metric label="Bookings" value={String(hotel.bookings)} />
        <Metric label="Revenue" value={formatLkr(hotel.revenue)} />
      </div>
      <div className="mt-5">
        <HotelActions hotel={hotel} onStatus={onStatus} updatingId={updatingId} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--color-muted)] px-2 py-3">
      <p className="font-black text-[var(--color-midnight)]">{value}</p>
      <p className="mt-1">{label}</p>
    </div>
  );
}

function HotelActions({ hotel, onStatus, updatingId }: { hotel: AdminHotel; onStatus?: (id: string, status: string) => void; updatingId?: string }) {
  const busy = updatingId === hotel.id;
  const approved = hotel.status === "approved";
  const rejected = hotel.status === "rejected";
  const suspended = hotel.status === "suspended";

  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton disabled={busy || approved} onClick={() => onStatus?.(hotel.id, "approved")} tone="approve" icon={<Check size={15} />}>
        {approved ? "Approved" : "Approve"}
      </ActionButton>
      <ActionButton disabled={busy || rejected} onClick={() => onStatus?.(hotel.id, "rejected")} tone="reject" icon={<Ban size={15} />}>
        {rejected ? "Rejected" : "Reject"}
      </ActionButton>
      <ActionButton disabled={busy || rejected || suspended} onClick={() => onStatus?.(hotel.id, "suspended")} tone="neutral" icon={<PauseCircle size={15} />}>
        {suspended ? "Suspended" : "Suspend"}
      </ActionButton>
    </div>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
  tone,
  icon,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  tone: "approve" | "reject" | "neutral";
  icon: React.ReactNode;
}) {
  const toneClass = {
    approve: "bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-emerald-100 disabled:text-emerald-700",
    reject: "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:bg-red-50 disabled:text-red-300",
    neutral: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-300",
  }[tone];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold transition disabled:cursor-not-allowed ${toneClass}`}
    >
      {icon}
      {children}
    </button>
  );
}
