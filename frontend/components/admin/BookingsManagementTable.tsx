import { AdminBooking } from "@/types/admin";
import AdminStatusBadge from "./AdminStatusBadge";
import { formatLkr } from "@/lib/currency";

export default function BookingsManagementTable({ bookings }: { bookings: AdminBooking[] }) {
  if (bookings.length === 0) {
    return <div className="rounded-[1.5rem] border border-dashed border-emerald-200 bg-white p-8 text-center text-sm text-slate-600">No bookings found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:hidden">
        {bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
      </div>
      <div className="hidden overflow-x-auto rounded-[1.5rem] border border-emerald-100 bg-white shadow-sm xl:block">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-muted)] text-left text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr><th className="px-5 py-4">Booking</th><th>Customer</th><th>Provider</th><th>Type</th><th>District</th><th>Total</th><th>Commission</th><th>Provider</th><th>Status</th><th className="px-5">Date</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const commission = b.totalAmount * 0.03;
              const provider = b.totalAmount * 0.97;
              return (
                <tr key={b.id} className="border-t border-emerald-100 text-slate-700">
                  <td className="px-5 py-4 font-extrabold text-[var(--color-midnight)]">{b.id}</td>
                  <td>{b.customer}</td>
                  <td className="max-w-60 truncate">{b.provider}</td>
                  <td className="capitalize">{b.type}</td>
                  <td>{b.district || "-"}</td>
                  <td>{formatLkr(b.totalAmount)}</td>
                  <td>{formatLkr(commission)}</td>
                  <td>{formatLkr(provider)}</td>
                  <td><AdminStatusBadge status={b.status} /></td>
                  <td className="px-5">{formatDate(b.date)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: AdminBooking }) {
  const commission = booking.totalAmount * 0.03;
  const provider = booking.totalAmount * 0.97;
  return (
    <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-teal)]">{booking.id}</p>
          <h3 className="mt-2 truncate text-lg font-extrabold text-[var(--color-midnight)]">{booking.provider}</h3>
          <p className="mt-1 text-sm text-slate-500">{booking.customer} · {booking.type}</p>
        </div>
        <AdminStatusBadge status={booking.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <Metric label="Total" value={formatLkr(booking.totalAmount)} />
        <Metric label="Date" value={formatDate(booking.date)} />
        <Metric label="Commission" value={formatLkr(commission)} />
        <Metric label="Provider" value={formatLkr(provider)} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[var(--color-muted)] p-3"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 font-extrabold text-[var(--color-midnight)]">{value}</p></div>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
