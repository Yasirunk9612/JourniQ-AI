import { AdminBooking } from "@/types/admin";
import AdminStatusBadge from "./AdminStatusBadge";
import { formatLkr } from "@/lib/currency";

export default function BookingsManagementTable({ bookings }: { bookings: AdminBooking[] }) {
  return <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white"><table className="min-w-full text-sm"><thead className="bg-emerald-50 text-left"><tr><th className="px-4 py-3">Booking ID</th><th>Customer</th><th>Provider</th><th>Type</th><th>District</th><th>Total</th><th>Commission (3%)</th><th>Provider (97%)</th><th>Status</th><th>Date</th></tr></thead><tbody>{bookings.map((b) => { const c = b.totalAmount * 0.03; const p = b.totalAmount * 0.97; return <tr key={b.id} className="border-t border-emerald-100"><td className="px-4 py-3">{b.id}</td><td>{b.customer}</td><td>{b.provider}</td><td className="capitalize">{b.type}</td><td>{b.district}</td><td>{formatLkr(b.totalAmount)}</td><td>{formatLkr(c)}</td><td>{formatLkr(p)}</td><td><AdminStatusBadge status={b.status} /></td><td>{b.date}</td></tr>; })}</tbody></table></div>;
}
