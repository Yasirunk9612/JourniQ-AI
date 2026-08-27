import ProtectedRoute from "@/components/ProtectedRoute";
import HotelOwnerSidebar from "@/components/hotel-owner/HotelOwnerSidebar";
import HotelOwnerTopbar from "@/components/hotel-owner/HotelOwnerTopbar";

export default function HotelOwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["hotel_owner"]}>
      <div className="min-h-screen bg-[var(--color-sand)] lg:flex">
        <HotelOwnerSidebar />
        <section className="flex-1">
          <HotelOwnerTopbar />
          <main className="p-4 md:p-6">{children}</main>
        </section>
      </div>
    </ProtectedRoute>
  );
}
