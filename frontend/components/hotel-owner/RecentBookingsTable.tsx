import BookingStatusBadge from "./BookingStatusBadge";
import { Booking } from "@/types/hotelOwner";
import { formatLkr } from "@/lib/currency";

export default function RecentBookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-emerald-50 text-emerald-800"><tr><th className="px-4 py-3">Booking ID</th><th className="px-4 py-3">Guest</th><th className="px-4 py-3">Room</th><th className="px-4 py-3">Check-in</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id || b.bookingId || b.id} className="border-t border-emerald-100"><td className="px-4 py-3">{b.bookingId || b.id}</td><td className="px-4 py-3">{b.guestName}</td><td className="px-4 py-3">{b.roomType}</td><td className="px-4 py-3">{String(b.checkIn).slice(0, 10)}</td><td className="px-4 py-3">{formatLkr(b.totalAmount)}</td><td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
