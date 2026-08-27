import { BookingStatus } from "@/types/hotelOwner";

const styles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-sky-100 text-sky-800",
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}
