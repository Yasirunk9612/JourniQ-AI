import { ProviderBooking } from "@/types/activityProvider";
import ProviderStatusBadge from "./ProviderStatusBadge";
import { formatLkr } from "@/lib/currency";

export default function ProviderBookingsTable({ bookings, onStatus }: { bookings: ProviderBooking[]; onStatus: (id: string, status: ProviderBooking["status"]) => void }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white">
      <table className="w-full min-w-[980px] text-sm"><thead className="bg-emerald-50 text-emerald-800"><tr><th className="px-4 py-3 text-left">Booking ID</th><th className="px-4 py-3 text-left">Tourist</th><th className="px-4 py-3 text-left">Experience</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Guests</th><th className="px-4 py-3 text-left">Total</th><th className="px-4 py-3 text-left">3%</th><th className="px-4 py-3 text-left">Provider</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
        <tbody>{bookings.map((b) => { const id = b._id || b.bookingId; const commission = b.totalAmount * 0.03; const earning = b.totalAmount * 0.97; return <tr key={id} className="border-t border-emerald-100"><td className="px-4 py-3">{b.bookingId}</td><td className="px-4 py-3">{b.touristName}</td><td className="px-4 py-3">{b.experienceTitle}</td><td className="px-4 py-3">{String(b.date).slice(0,10)}</td><td className="px-4 py-3">{b.guests}</td><td className="px-4 py-3">{formatLkr(b.totalAmount)}</td><td className="px-4 py-3">{formatLkr(commission)}</td><td className="px-4 py-3">{formatLkr(earning)}</td><td className="px-4 py-3"><ProviderStatusBadge status={b.status} /></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => onStatus(id, "confirmed")} className="rounded-lg bg-emerald-700 px-2 py-1 text-xs text-white">Confirm</button><button onClick={() => onStatus(id, "rejected")} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700">Reject</button><button onClick={() => onStatus(id, "completed")} className="rounded-lg border border-indigo-200 px-2 py-1 text-xs text-indigo-700">Complete</button></div></td></tr>; })}</tbody>
      </table>
    </div>
  );
}
